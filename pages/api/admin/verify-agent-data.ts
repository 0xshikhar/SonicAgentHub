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

        // For testing purposes, we'll return mock verification data
        // In a real implementation, you would query the database tables
        
        // Check if user exists in agent_chain_users
        const userExists = true
        
        // Check if Twitter profile data exists in agent_chain_action_events
        const twitterProfileExists = true
        
        // Check if tweets exist in agent_chain_saved_tweets
        const savedTweetsCount = 10
        
        // Check if tweet collection metadata exists in agent_chain_action_events
        const tweetCollectionExists = true
        
        // Check if wallet exists in agent_chain_wallets
        const walletExists = true
        
        // Return verification results
        return res.status(200).json({
            userExists,
            twitterProfileExists,
            savedTweetsCount,
            tweetCollectionExists,
            walletExists,
            allDataExists: userExists && twitterProfileExists && savedTweetsCount > 0 && tweetCollectionExists && walletExists
        })
    } catch (error) {
        console.error('[ADMIN] Error in verify-agent-data API:', error)
        await postErrorToDiscord(`Error in verify-agent-data API: ${error}`)
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
} 