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

import agentCoinABI from "./contract/abi/AgentCoin.json";
import nftABI from "./contract/abi/AgentNFTsCollection.json";
import { AgentWalletRow } from "./types";

/**
 * Creates a new wallet for an agent and saves it to the database
 * @param handle The Twitter handle of the agent
 * @returns A boolean indicating whether the wallet was created successfully
 */
export async function createAndSaveNewWallet(handle: string): Promise<boolean> {
    try {
        handle = cleanHandle(handle);

        const newWallet = ethers.Wallet.createRandom();
        console.log(`Created random wallet for ${handle}: ${newWallet.address}`);

        // Check if RPC_URL is available
        if (!process.env.RPC_URL) {
            console.warn("RPC_URL not configured. Skipping permit signature generation.");
            
            // Save wallet without permit signature in development mode
            await createWallet({
                handle,
                address: newWallet.address,
                privateKey: newWallet.privateKey,
                permitSignature: "development-mode-no-signature",
            });
            
            return true;
        }

        // Get the signature for permit
        try {
            const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
            const plainWallet = new ethers.Wallet(newWallet.privateKey, provider);
            const tokenContract = new ethers.Contract(
                ERC20_TOKEN_CONTRACT_ADDRESS!,
                agentCoinABI,
                plainWallet
            );

            const permitSignature = await signPermit({
                wallet: plainWallet,
                token: tokenContract,
                spender: DEPLOYER_WALLET_ADDRESS,
            });

            await createWallet({
                handle,
                address: newWallet.address,
                privateKey: newWallet.privateKey,
                permitSignature,
            });
        } catch (error) {
            console.error("Error connecting to RPC or generating permit signature:", error);
            
            // Save wallet without permit signature as fallback
            await createWallet({
                handle,
                address: newWallet.address,
                privateKey: newWallet.privateKey,
                permitSignature: "error-generating-signature",
            });
        }

        console.log(`💰 wallet created for ${handle}`);
        await postErrorToDiscord(`💰 wallet created for ${handle}`);
        return true;
    } catch (error) {
        console.error("🔴 Error in createAndSaveNewWallet:", error);
        await postErrorToDiscord(
            "🔴 Error in createAndSaveNewWallet: " + String(error)
        );
        return false;
    }
}

/**
 * Sends initial funds to a newly created wallet
 * @param address The address of the wallet to send funds to
 * @returns A boolean indicating whether the funds were sent successfully
 */
export async function sendInitialFundsToWallet(address: string): Promise<boolean> {
    try {
        // Check if RPC_URL is available
        if (!process.env.RPC_URL) {
            console.warn("RPC_URL not configured. Skipping sending initial funds.");
            return true; // Return true to allow the flow to continue in development
        }

        // Continue with sending funds if RPC_URL is available
        try {
            const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
            const deployerWallet = new ethers.Wallet(
                process.env.DEPLOYER_WALLET_PRIVATE_KEY!,
                provider
            );
            const tokenContract = new ethers.Contract(
                ERC20_TOKEN_CONTRACT_ADDRESS!,
                agentCoinABI,
                deployerWallet
            );

            const tx = await tokenContract.transfer(
                address,
                ethers.utils.parseEther("100")
            );
            await tx.wait();

            console.log(`💰 Initial funds sent to ${address}`);
            return true;
        } catch (error) {
            console.error("Error sending initial funds:", error);
            await postErrorToDiscord(
                `🔴 Error sending initial funds to ${address}: ${String(error)}`
            );
            return false;
        }
    } catch (error) {
        console.error("🔴 Error in sendInitialFundsToWallet:", error);
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