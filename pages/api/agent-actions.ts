import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/types/supabase'
import { getRecentActionResults } from '@/lib/agent-actions'
import { createApiSupabaseClient } from "@/lib/supabase"; // Import the API client creator instead of the default client


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

        console.log(`[DEBUG] Fetching recent actions for handle: ${handle}`)
        
        // Get recent actions
        const actions = await getRecentActionResults(
            handle as string, 
            limit ? parseInt(limit as string, 10) : 5
        )
        
        // Return the actions
        return res.status(200).json({
            success: true,
            actions
        })
    } catch (error: any) {
        console.error('[DEBUG] Error fetching recent actions:', error)
        return res.status(500).json({
            success: false,
            error: `Error fetching recent actions: ${error.message || 'Unknown error'}`
        })
    }
} 