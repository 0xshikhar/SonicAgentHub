import { NextApiRequest, NextApiResponse } from "next"
import { createApiSupabaseClient } from "@/lib/supabase"
import { postErrorToDiscord } from "@/lib/discord"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        // Extract parameters from query
        const { handle, adminAddress } = req.query

        // Validate required parameters
        if (!handle || typeof handle !== 'string') {
            return res.status(400).json({ success: false, error: 'Twitter handle is required' })
        }

        // Validate admin address
        if (adminAddress !== ADMIN_WALLET_ADDRESS) {
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }

        console.log(`🔍 [ADMIN] Verifying data for Twitter handle: ${handle}`)

        // Create Supabase client
        console.log('Creating API Supabase client with URL and key available')
        const supabase = createApiSupabaseClient()
        console.log('Using service role client for API route')

        // Check if user exists in agent_chain_users
        console.log(`Checking if user ${handle} exists in agent_chain_users table`)
        const { data: userData, error: userError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', handle)
            .single()
        
        if (userError) {
            console.error(`Error checking user existence: ${userError.message}`)
        }
        
        const userExists = !!userData
        console.log(`User exists: ${userExists}`, userData ? `(ID: ${userData.handle})` : '')
        
        // Check if Twitter profile data exists in agent_chain_action_events
        console.log(`Checking if Twitter profile data exists for ${handle}`)
        const { data: twitterProfileData, error: twitterProfileError } = await supabase
            .from('agent_chain_action_events')
            .select('*')
            .eq('from_handle', handle)
            .eq('action_type', 'twitter_profile_saved')
            .single()
        
        if (twitterProfileError) {
            console.error(`Error checking Twitter profile data: ${twitterProfileError.message}`)
        }
        
        const twitterProfileExists = !!twitterProfileData
        console.log(`Twitter profile data exists: ${twitterProfileExists}`)
        
        // Check if tweets exist in agent_chain_saved_tweets
        console.log(`Checking if tweets exist for ${handle}`)
        const { data: tweetsData, error: tweetsError } = await supabase
            .from('agent_chain_saved_tweets')
            .select('*')
            .eq('handle', handle)
        
        if (tweetsError) {
            console.error(`Error checking tweets: ${tweetsError.message}`)
        }
        
        const savedTweetsCount = tweetsData ? tweetsData.length : 0
        console.log(`Saved tweets count: ${savedTweetsCount}`)
        
        // Check if tweet collection metadata exists in agent_chain_action_events
        console.log(`Checking if tweet collection metadata exists for ${handle}`)
        const { data: tweetCollectionData, error: tweetCollectionError } = await supabase
            .from('agent_chain_action_events')
            .select('*')
            .eq('from_handle', handle)
            .eq('action_type', 'tweets_collection_saved')
            .single()
        
        if (tweetCollectionError) {
            console.error(`Error checking tweet collection metadata: ${tweetCollectionError.message}`)
        }
        
        const tweetCollectionExists = !!tweetCollectionData
        console.log(`Tweet collection metadata exists: ${tweetCollectionExists}`)
        
        // Check if wallet exists
        let walletData = null
        try {
            console.log(`Checking if wallet exists for ${handle} in agent_chain_wallets table`)
            const { data, error } = await supabase
                .from('agent_chain_wallets')
                .select('*')
                .eq('handle', handle)
                .maybeSingle()
                
            if (error) {
                console.error(`Error checking wallet: ${error.message}`)
            } else if (data) {
                walletData = data
                console.log(`Wallet found for ${handle} with address: ${data.address}`)
                
                // Check if address is a valid Ethereum address
                if (data.address && data.address.match(/^0x[a-fA-F0-9]{40}$/)) {
                    console.log(`Wallet has valid Ethereum address: ${data.address}`)
                } else {
                    console.log(`Wallet has invalid Ethereum address: ${data.address}`)
                }
                
                // Check if private key exists
                if (data.private_key) {
                    console.log(`Wallet has private key`)
                } else {
                    console.log(`Wallet is missing private key`)
                }
                
                // Check if permit signature exists
                if (data.permit_signature) {
                    console.log(`Wallet has permit signature`)
                } else {
                    console.log(`Wallet is missing permit signature`)
                }
            } else {
                console.log(`No wallet found for ${handle} in agent_chain_wallets table`)
            }
        } catch (error) {
            console.error(`Unexpected error checking wallet: ${error instanceof Error ? error.message : String(error)}`)
            console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        }
        
        const walletExists = !!walletData
        console.log(`Wallet exists: ${walletExists}`, walletData ? `(Address: ${walletData.address})` : '')
        
        // Prepare detailed response
        const allDataExists = userExists && twitterProfileExists && savedTweetsCount > 0 && tweetCollectionExists && walletExists
        
        const response = {
            success: true,
            message: allDataExists 
                ? `All required data exists for ${handle}` 
                : `Some data is missing for ${handle}`,
            userExists,
            twitterProfileExists,
            savedTweetsCount,
            tweetCollectionExists,
            walletExists,
            allDataExists,
            details: {
                user: userData || null,
                twitterProfile: twitterProfileData || null,
                tweetsCount: savedTweetsCount,
                tweetCollection: tweetCollectionData || null,
                wallet: walletData ? { 
                    handle: walletData.handle,
                    address: walletData.address,
                    // Don't include private key in response
                } : null
            }
        }
        
        console.log(`Verification complete for ${handle}. All data exists: ${allDataExists}`)
        
        // Return verification results
        return res.status(200).json(response)
    } catch (error) {
        console.error('[ADMIN] Error in verify-agent-data API:', error)
        await postErrorToDiscord(`Error in verify-agent-data API: ${error}`)
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
        })
    }
} 