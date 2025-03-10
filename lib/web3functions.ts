import { Contract, ethers } from "ethers";
import { createWallet, getWalletByHandle } from "./supabase-db";
import { postErrorToDiscord } from "./discord";
import { cleanHandle } from "./strings";
import {
    DEPLOYER_WALLET_ADDRESS,
    ERC20_TOKEN_CONTRACT_ADDRESS,
    NFT_CONTRACT_ADDRESS,
} from "./constants";
import { revalidateTag, unstable_cache } from "next/cache";
import supabase from './supabase'

import agentCoinABI from "./contract/abi/AgentCoin.json";
import nftABI from "./contract/abi/AgentNFTsCollection.json";
import { AgentWalletRow } from "./types";

/**
 * Creates a new wallet for an agent and saves it to the database
 * @param handle The Twitter handle of the agent
 * @returns The created wallet data or false if creation failed
 */
export async function createAndSaveNewWallet(handle: string) {
    try {
        console.log(`[WEB3] Creating new wallet for handle: ${handle}`)
        
        // Generate a new wallet
        const newWallet = ethers.Wallet.createRandom();
        console.log(`[WEB3] Generated new wallet with address: ${newWallet.address}`)
        
        // Check if wallet already exists
        const existingWallet = await getWalletByHandle(handle);
        if (existingWallet) {
            console.log(`[WEB3] Wallet already exists for handle: ${handle} with address: ${existingWallet.address}`)
            return existingWallet;
        }
        
        console.log(`[WEB3] No existing wallet found, proceeding with wallet creation for: ${handle}`)
        
        // Create a provider and connect to the network
        try {
            console.log(`[WEB3] Connecting to RPC URL: ${process.env.RPC_URL}`)
            const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
            const plainWallet = new ethers.Wallet(process.env.DEPLOYER_WALLET_PRIVATE_KEY!, provider);
            
            // Get the token contract
            const tokenContract = new ethers.Contract(
                ERC20_TOKEN_CONTRACT_ADDRESS!,
                agentCoinABI,
                plainWallet
            );
            
            console.log(`[WEB3] Connected to network, generating permit signature for: ${handle}`)
            
            // Generate permit signature
            const permitSignature = await signPermit({
                wallet: plainWallet,
                token: tokenContract,
                spender: DEPLOYER_WALLET_ADDRESS,
            });
            
            console.log(`[WEB3] Generated permit signature, saving wallet to database for: ${handle}`)
            
            // Save wallet to database
            const walletData = await createWallet({
                handle,
                address: newWallet.address,
                privateKey: newWallet.privateKey,
                permitSignature,
            });
            
            if (!walletData) {
                console.error(`[WEB3] Failed to save wallet to database for: ${handle}`)
                return null;
            }
            
            console.log(`[WEB3] Successfully saved wallet to database for: ${handle}`)
            
            // Try to send initial funds
            try {
                console.log(`[WEB3] Attempting to send initial funds to: ${newWallet.address}`)
                await sendInitialFundsToWallet(newWallet.address);
                console.log(`[WEB3] Successfully sent initial funds to: ${newWallet.address}`)
            } catch (fundingError) {
                console.error(`[WEB3] Error sending initial funds: ${fundingError instanceof Error ? fundingError.message : String(fundingError)}`)
            }
            
            return walletData;
        } catch (error) {
            console.error(`[WEB3] Error connecting to RPC or generating permit signature: ${error instanceof Error ? error.message : String(error)}`)
            
            // Save wallet without permit signature as fallback
            console.log(`[WEB3] Attempting to save wallet without permit signature as fallback for: ${handle}`)
            const walletData = await createWallet({
                handle,
                address: newWallet.address,
                privateKey: newWallet.privateKey,
                permitSignature: "error-generating-signature",
            });
            
            if (!walletData) {
                console.error(`[WEB3] Failed to save fallback wallet to database for: ${handle}`)
                return null;
            }
            
            console.log(`[WEB3] Successfully saved fallback wallet to database for: ${handle}`)
            
            // Try to send initial funds
            try {
                console.log(`[WEB3] Attempting to send initial funds to fallback wallet: ${newWallet.address}`)
                await sendInitialFundsToWallet(newWallet.address);
                console.log(`[WEB3] Successfully sent initial funds to fallback wallet: ${newWallet.address}`)
            } catch (fundingError) {
                console.error(`[WEB3] Error sending initial funds to fallback wallet: ${fundingError instanceof Error ? fundingError.message : String(fundingError)}`)
            }
            
            return walletData;
        }
    } catch (error) {
        console.error(`[WEB3] Unexpected error in createAndSaveNewWallet: ${error instanceof Error ? error.message : String(error)}`)
        console.error(`[WEB3] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        return null;
    }
}

/**
 * Sends initial funds to a newly created wallet
 * @param address The address of the wallet to send funds to
 * @returns A boolean indicating whether the funds were sent successfully
 */
export async function sendInitialFundsToWallet(address: string): Promise<boolean> {
    try {
        console.log(`[FUNDING] Starting process to send initial funds to wallet: ${address}`);
        
        // Check if RPC_URL is available
        console.log(`[FUNDING] Checking if RPC_URL is available: ${!!process.env.RPC_URL}`);
        if (!process.env.RPC_URL) {
            console.warn("[FUNDING] RPC_URL not configured. Skipping sending initial funds.");
            console.log(`[FUNDING] Returning true to allow the flow to continue in development`);
            return true; // Return true to allow the flow to continue in development
        }

        // Continue with sending funds if RPC_URL is available
        try {
            console.log(`[FUNDING] Creating provider with RPC_URL: ${process.env.RPC_URL}`);
            const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
            
            console.log(`[FUNDING] Creating deployer wallet with private key`);
            const deployerWallet = new ethers.Wallet(
                process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
                provider
            );
            console.log(`[FUNDING] Deployer wallet address: ${deployerWallet.address}`);
            
            console.log(`[FUNDING] Creating token contract with address: ${ERC20_TOKEN_CONTRACT_ADDRESS}`);
            const tokenContract = new ethers.Contract(
                ERC20_TOKEN_CONTRACT_ADDRESS!,
                agentCoinABI,
                deployerWallet
            );

            console.log(`[FUNDING] Sending 100 tokens to address: ${address}`);
            const tx = await tokenContract.transfer(
                address,
                ethers.utils.parseEther("100")
            );
            console.log(`[FUNDING] Transaction hash: ${tx.hash}`);
            
            console.log(`[FUNDING] Waiting for transaction confirmation...`);
            await tx.wait();

            console.log(`[FUNDING] Initial funds sent successfully to ${address}`);
            return true;
        } catch (error) {
            console.error(`[FUNDING] Error sending initial funds:`, error);
            console.error(`[FUNDING] Error details: ${error instanceof Error ? error.message : String(error)}`);
            console.error(`[FUNDING] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
            await postErrorToDiscord(
                `🔴 Error sending initial funds to ${address}: ${String(error)}`
            );
            return false;
        }
    } catch (error) {
        console.error(`[FUNDING] Unexpected error in sendInitialFundsToWallet:`, error);
        console.error(`[FUNDING] Error details: ${error instanceof Error ? error.message : String(error)}`);
        console.error(`[FUNDING] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        await postErrorToDiscord(
            "🔴 Error in sendInitialFundsToWallet: " + String(error)
        );
        return false;
    }
}

export const getBalanceByHandleNoCache = async (handle: string) => {
    const wallet = await getWalletByHandle(handle);
    if (!wallet) {
        return "0";
    }
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    const minABI = ["function balanceOf(address owner) view returns (uint256)"];

    const tokenContract = new ethers.Contract(
        ERC20_TOKEN_CONTRACT_ADDRESS!,
        minABI,
        provider
    );

    const balance = await tokenContract.balanceOf(wallet.address);
    return balance.toString();
};

export const getBalanceByHandleCached = (handle: string) =>
    unstable_cache(
        () => getBalanceByHandleNoCache(handle),
        [`balance-by-handle-${handle}`],
        {
            revalidate: 60 * 10,
            tags: [`balance-${handle}`],
        }
    )();

// Infinite value and deadline
const INFINITE_VALUE = ethers.constants.MaxUint256;
const INFINITE_DEADLINE = ethers.constants.MaxUint256;

export const signPermit = async ({
    wallet,
    token,
    spender,
}: {
    wallet: ethers.Wallet;
    token: ethers.Contract;
    spender: string;
}): Promise<string> => {
    if (!wallet.provider) {
        throw new Error("Wallet provider not found");
    }

    const nonce = await token.nonces(wallet.address);

    // Get the DOMAIN_SEPARATOR from the token contract
    const domain = {
        name: await token.name(),
        version: "1",
        chainId: (await wallet.provider.getNetwork()).chainId,
        verifyingContract: token.address,
    };

    const message = {
        owner: wallet.address,
        spender: spender,
        value: INFINITE_VALUE,
        nonce: nonce,
        deadline: INFINITE_DEADLINE,
    };

    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };

    // Sign message using EIP-712
    const signature = await wallet._signTypedData(domain, types, message);

    return signature;
};

export async function transferFromCloneToClone(
    token: ethers.Contract,
    deployer: ethers.Wallet,
    cloneA: string,
    cloneB: string,
    amount: ethers.BigNumber,
    privateKeyA: string,
    deadline: ethers.BigNumber = ethers.constants.MaxUint256
): Promise<void> {
    console.log("🚀 Starting transfer between agents...");

    // Create wallet for cloneA using its private key
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const walletA = new ethers.Wallet(privateKeyA, provider);

    console.log("🔴 signPermit");
    // Generate fresh permit signature
    const signature = await signPermit({
        wallet: walletA,
        token,
        spender: deployer.address,
    });

    console.log("🔴 signature", signature);
    // Rest of the function remains the same
    const tokenWithPermit = new ethers.Contract(
        token.address,
        agentCoinABI,
        deployer
    );
    const sigParts = ethers.utils.splitSignature(signature);

    try {
        console.log("🔴 permitTx CALLING NOW");
        const permitTx = await tokenWithPermit.permit(
            cloneA,
            deployer.address,
            INFINITE_VALUE,
            deadline,
            sigParts.v,
            sigParts.r,
            sigParts.s
        );
        console.log("🔴 permitTx WAITING");
        await permitTx.wait();

        console.log("🔴 permitTx WAITING DONE");

        console.log("🔴 transferTx CALLING NOW");
        const transferTx = await tokenWithPermit.transferFrom(
            cloneA,
            cloneB,
            amount
        );

        console.log("🔴 transferTx WAITING");
        await transferTx.wait();
        console.log("🔴 transferTx WAITING DONE");
    } catch (error) {
        console.error("❌ Transaction failed!", error);
        throw error;
    }
}

export const sendMoneyFromWalletAToWalletB = async ({
    walletA,
    walletB,
    amount,
}: {
    walletA: AgentWalletRow;
    walletB: AgentWalletRow;
    amount: ethers.BigNumber;
}) => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(
        process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
        provider
    );
    const tokenContract = new ethers.Contract(
        ERC20_TOKEN_CONTRACT_ADDRESS,
        agentCoinABI,
        signer
    );

    await transferFromCloneToClone(
        tokenContract,
        signer,
        walletA.address,
        walletB.address,
        amount,
        walletA.private_key
    );
    revalidateTag(`balance-${walletA.handle}`);
    revalidateTag(`balance-${walletB.handle}`);

    const amountInEthers = ethers.utils.formatEther(amount);
    await postErrorToDiscord(
        `💸 Sent ${amountInEthers} $AGENT from ${walletA.address} to ${walletB.address}`
    );
};

export const mintNftForAgent = async ({
    userHandle,
    artworkUrl,
    nftArtTitle,
}: {
    userHandle: string;
    artworkUrl: string;
    nftArtTitle: string;
}) => {
    const agentWallet = await getWalletByHandle(userHandle);
    if (!agentWallet) {
        throw new Error("Wallet not found");
    }

    // Create a provider and signer
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const deployerWallet = new ethers.Wallet(
        process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
        provider
    );

    // Create contract instance
    const contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        nftABI,
        deployerWallet
    );

    console.log("NFT minting with the following data:");
    console.log("nftImageURL:", artworkUrl);
    console.log("nftTitle:", nftArtTitle);
    console.log("agentAddress:", agentWallet.address);

    // Call the mint function
    try {
        const tx = await contract.mintAgentNFTsCollection(
            agentWallet.address,
            artworkUrl,
            nftArtTitle
        );
        console.log(
            "Transaction sent, waiting for confirmation... (tx hash:",
            tx.hash,
            ")"
        );

        await postErrorToDiscord(`💸 NFT minted! Confirmed in block: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(
            "NFT minted successfully! Confirmed in block:",
            receipt.blockNumber
        );

        return tx.hash;
    } catch (error) {
        console.error("Error minting NFT:", error);
        await postErrorToDiscord(`🔴 Error minting NFT for agent: ${userHandle}`);
        throw error;
    }
};

export const ownedNFTs = async (address: string): Promise<number> => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftABI, provider);

    try {
        const balance = await contract.balanceOf(address);
        return Number(balance);
    } catch (error) {
        console.error("Error getting NFT balance:", error);
        return 0;
    }
};

export const sendMoneyToAgentFromGovernment = async ({
    wallet,
    amount,
    handle,
}: {
    wallet: AgentWalletRow;
    amount: ethers.BigNumber;
    handle: string;
}) => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(
        process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
        provider
    );

    const tokenContract = new ethers.Contract(
        ERC20_TOKEN_CONTRACT_ADDRESS,
        agentCoinABI,
        signer
    );

    const tx = await tokenContract.transfer(wallet.address, amount);
    await tx.wait();

    revalidateTag(`balance-${handle}`);

    await postErrorToDiscord(
        `💸 Sent ${amount} Agent tokens to ${wallet.address} from the government to ${handle}`
    );
};

export const sendMoneyFromAgentToGovernment = async ({
    wallet,
    amount,
    handle,
}: {
    wallet: AgentWalletRow;
    amount: ethers.BigNumber;
    handle: string;
}) => {
    sendMoneyFromWalletAToWalletB({
        walletA: wallet,
        walletB: {
            address: DEPLOYER_WALLET_ADDRESS,
            handle: "government",
            private_key: process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
            permit_signature: "",
        },
        amount,
    });

    revalidateTag(`balance-${handle}`);

    const amountInEthers = ethers.utils.formatEther(amount);

    await postErrorToDiscord(
        `💸 The Government charged ${amountInEthers} $AGENT from ${handle}!!`
    );
};

/**
 * Get wallet information for a handle - Pages Router compatible version
 * This version doesn't use cookies() from next/headers which causes issues in Pages Router
 */
export async function getWalletByHandleForPages(handle: string) {
    try {
        handle = cleanHandle(handle)
        console.log(`[PAGES GET WALLET] Starting wallet retrieval for handle: ${handle}`)
        
        // Log the Supabase client being used
        const supabaseClient = supabase()
        console.log(`[PAGES GET WALLET] Supabase client initialized:`, 
            supabaseClient ? 'Success' : 'Failed')
        
        // Check if the agent_chain_wallets table exists
        console.log(`[PAGES GET WALLET] Checking if agent_chain_wallets table exists`)
        const { data: tableCheck, error: tableError } = await supabaseClient
            .from('agent_chain_wallets')
            .select('count', { count: 'exact', head: true })
        
        if (tableError) {
            console.error(`[PAGES GET WALLET] Error checking table:`, tableError)
        } else {
            console.log(`[PAGES GET WALLET] Table check result:`, tableCheck)
        }
        
        console.log(`[PAGES GET WALLET] Querying agent_chain_wallets table for handle: ${handle}`)
        const { data, error } = await supabaseClient
            .from('agent_chain_wallets')
            .select('*')
            .eq('handle', handle)
            .single()
        
        // Log the full query result for debugging
        console.log(`[PAGES GET WALLET] Query result data:`, data)
        if (error) {
            console.error(`[PAGES GET WALLET] Query error:`, error)
        }
        
        if (error) {
            console.error(`[PAGES GET WALLET] Error retrieving wallet:`, error)
            
            // Check if it's a "not found" error
            if (error.code === 'PGRST116') {
                console.log(`[PAGES GET WALLET] No wallet found for handle: ${handle}`)
            }
            
            return null
        }
        
        if (data) {
            console.log(`[PAGES GET WALLET] Successfully retrieved wallet for ${handle} with address: ${data.address}`)
            // Log wallet data structure (without exposing private key)
            console.log(`[PAGES GET WALLET] Wallet data structure:`, {
                handle: data.handle,
                address: data.address,
                has_private_key: Boolean(data.private_key),
                has_permit_signature: Boolean(data.permit_signature),
                created_at: data.created_at
            })
        } else {
            console.log(`[PAGES GET WALLET] No wallet found for handle: ${handle}`)
        }
        
        return data
    } catch (error) {
        console.error(`[PAGES GET WALLET] Unexpected error in getWalletByHandleForPages:`, error)
        console.error(`[PAGES GET WALLET] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        return null
    }
} 