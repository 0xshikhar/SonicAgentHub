import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/types/supabase'
import { executeRandomAction, saveActionResult, OnchainAgent } from '@/lib/agent-actions'
import { createApiSupabaseClient } from "@/lib/supabase";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) { 
    const supabase = createApiSupabaseClient();
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { handle, category } = req.body
        console.log('[DEBUG] Received request with body:', req.body)

        if (!handle) {
            console.log('[DEBUG] Missing required parameter: handle')
            return res.status(400).json({
                success: false,
                error: 'Missing required parameter: handle'
            })
        }

        console.log(`[DEBUG] Processing random action request for handle: ${handle}`)
        
        // Try to find the agent with case-insensitive matching
        console.log(`[DEBUG] Executing query for handle: ${handle}`)
        const { data: onchainAgent, error: onchainAgentError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .ilike('handle', handle)
            .limit(1)
        
        console.log('[DEBUG] Query result:', { data: onchainAgent, error: onchainAgentError })
        
        if (onchainAgentError) {
            console.error('[DEBUG] Error fetching from agent_chain_users:', onchainAgentError)
            return res.status(500).json({
                success: false,
                error: 'Error fetching agent data'
            })
        }
        
        if (!onchainAgent || onchainAgent.length === 0) {
            console.log(`[DEBUG] No agent found in agent_chain_users with handle: ${handle}`)
            return res.status(404).json({
                success: false,
                error: 'Onchain agent not found'
            })
        }
        
        // We found the agent, now execute a random action
        try {
            // Use type assertion to define the structure of agentData
            const agentData = onchainAgent[0] as unknown as OnchainAgent
            
            console.log('[DEBUG] Found agent in agent_chain_users:', agentData.handle)
            
            // Execute a random action
            const { action, result, tweetId } = await executeRandomAction(agentData, category)
            
            console.log('[DEBUG] Action executed:', action.name)
            console.log('[DEBUG] Result length:', result.length)
            console.log('[DEBUG] Tweet saved:', Boolean(tweetId))
            
            if (action.saveAsTweet && !tweetId) {
                console.warn('[DEBUG] Action was supposed to save a tweet, but no tweet ID was returned')
            }
            
            // Save the action result to the database
            await saveActionResult(agentData, action, result)
            
            // Return the result
            return res.status(200).json({
                success: true,
                action: {
                    id: action.id,
                    name: action.name,
                    description: action.description,
                    category: action.category,
                    saveAsTweet: action.saveAsTweet || false
                },
                result,
                tweetId,
                tweetSaved: Boolean(tweetId)
            })
        } catch (error: any) {
            console.error('[DEBUG] Error executing random action:', error)
            return res.status(500).json({
                success: false,
                error: `Error executing random action: ${error.message || 'Unknown error'}`
            })
        }
    } catch (error: any) {
        console.error('[DEBUG] Unexpected error:', error)
        return res.status(500).json({
            success: false,
            error: `Unexpected error: ${error.message || 'Unknown error'}`
        })
    }
} 