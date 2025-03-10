import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/types/supabase'
import { getRecentTweets } from '@/lib/agent-actions'
import { createApiSupabaseClient } from "@/lib/supabase";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const supabase = createApiSupabaseClient();
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { handle, limit } = req.query
        console.log('[DEBUG] Received request with query:', req.query)

        if (!handle) {
            console.log('[DEBUG] Missing required parameter: handle')
            return res.status(400).json({
                success: false,
                error: 'Missing required parameter: handle'
            })
        }

        console.log(`[DEBUG] Fetching recent tweets for handle: ${handle}`)
        
        // Get recent tweets
        const tweets = await getRecentTweets(
            handle as string, 
            limit ? parseInt(limit as string, 10) : 5
        )
        
        // Return the tweets
        return res.status(200).json({
            success: true,
            tweets
        })
    } catch (error: any) {
        console.error('[DEBUG] Error fetching recent tweets:', error)
        return res.status(500).json({
            success: false,
            error: `Error fetching recent tweets: ${error.message || 'Unknown error'}`
        })
    }
} 