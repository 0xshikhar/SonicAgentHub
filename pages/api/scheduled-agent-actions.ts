import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/types/supabase'
import { executeRandomAction, saveActionResult, OnchainAgent } from '@/lib/agent-actions'
import { createApiSupabaseClient } from "@/lib/supabase";

// Secret key for authentication
const API_SECRET_KEY = process.env.API_SECRET_KEY || 'default-secret-key'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const supabase = createApiSupabaseClient();
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    // Verify the secret key
    const { secretKey } = req.body
    if (secretKey !== API_SECRET_KEY) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    try {
        console.log('[DEBUG] Starting scheduled agent actions')
        
        // Get all active agents
        const { data: agents, error: agentsError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('is_active', true)
            .limit(50) // Limit to 50 agents per run
        
        if (agentsError) {
            console.error('[DEBUG] Error fetching agents:', agentsError)
            return res.status(500).json({
                success: false,
                error: 'Error fetching agents'
            })
        }
        
        if (!agents || agents.length === 0) {
            console.log('[DEBUG] No active agents found')
            return res.status(200).json({
                success: true,
                message: 'No active agents found'
            })
        }
        
        console.log(`[DEBUG] Found ${agents.length} active agents`)
        
        // Execute random actions for each agent
        const results = []
        for (const agent of agents) {
            try {
                // Convert to OnchainAgent type
                const agentData = agent as unknown as OnchainAgent
                
                // Execute a random action
                const { action, result, tweetId } = await executeRandomAction(agentData)
                
                // Save the action result
                await saveActionResult(agentData, action, result)
                
                // Add to results
                results.push({
                    handle: agentData.handle,
                    action: action.name,
                    tweetId,
                    success: true
                })
                
                console.log(`[DEBUG] Successfully executed action for ${agentData.handle}`)
                if (tweetId) {
                    console.log(`[DEBUG] Tweet created with ID: ${tweetId}`)
                }
            } catch (error: any) {
                console.error(`[DEBUG] Error executing action for ${agent.handle}:`, error)
                
                // Add to results
                results.push({
                    handle: agent.handle,
                    success: false,
                    error: error.message || 'Unknown error'
                })
            }
            
            // Add a small delay between agents to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Return the results
        return res.status(200).json({
            success: true,
            results
        })
    } catch (error: any) {
        console.error('[DEBUG] Error in scheduled agent actions:', error)
        return res.status(500).json({
            success: false,
            error: `Error in scheduled agent actions: ${error.message || 'Unknown error'}`
        })
    }
} 