import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatMessage } from '@/lib/types'
import { askGemini, generateGeminiResponse, ChatSession } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Define an extended ChatMessage type for internal use that includes id and timestamp
interface ExtendedChatMessage extends ChatSession {
    id?: string;
    timestamp?: Date;
}

// Default responses as fallback
const defaultResponses = [
    "I'm processing that request. Let me get back to you shortly.",
    "Interesting question! Let me think about that for a moment.",
    "I'm currently analyzing that information. I'll respond soon.",
    "I'm considering multiple perspectives on that. One moment please.",
    "That's a good point. Let me formulate a thoughtful response."
]

// Store conversation history for each user-agent pair
const conversationHistory: Record<string, ExtendedChatMessage[]> = {}

// Create a direct Supabase client for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create a Supabase client with the service role key
const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

/**
 * Generate a dynamic response using Gemini and the agent's system prompt
 */
async function generateDynamicResponse(
    handle: string,
    message: string,
    systemPrompt: string
): Promise<string> {
    console.log('[DEBUG] generateDynamicResponse called with:', { 
        handle, 
        messageLength: message?.length,
        systemPromptLength: systemPrompt?.length 
    });

    // Ensure message and systemPrompt are not undefined
    const safeMessage = message || "Hello";
    const safeSystemPrompt = systemPrompt || "";

    try {
        // Get conversation history for this user-agent pair
        const userAgentKey = `${handle}`;
        console.log('[DEBUG] User-agent key:', userAgentKey);

        // Initialize conversation history if it doesn't exist
        let history: ExtendedChatMessage[] = [];
        
        // Add the new message to the conversation history
        history.push({
            role: 'user',
            parts: safeMessage || "",
            id: `user-${Date.now()}`,
            timestamp: new Date()
        });
        console.log('[DEBUG] Added user message to history');

        // Generate a response using Gemini
        console.log('[DEBUG] Calling generateGeminiResponse with:', { 
            messageLength: safeMessage.length,
            systemPromptLength: safeSystemPrompt.length,
            historyLength: history.length
        });

        const responseFromGemini = await generateGeminiResponse(safeMessage, safeSystemPrompt, history);
        // Ensure we have a valid string response
        const response: string = responseFromGemini || "I apologize, but I encountered an error while processing your request. Please try again later.";
        
        console.log('[DEBUG] Response from generateGeminiResponse:', { responseLength: response.length });

        // If response is empty, use a fallback
        if (!response.trim()) {
            console.log('[DEBUG] Empty response from generateGeminiResponse, using fallback');
            const defaultResponses = [
                "I'm processing your request. Please give me a moment.",
                "I apologize, but I encountered an error while processing your request. Please try again later.",
                "I'm having trouble understanding your request. Could you please rephrase it?",
                "I'm currently experiencing technical difficulties. Please try again in a few moments."
            ];
            const fallbackResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)] || "";
            
            // Add the fallback response to the conversation history
            history.push({
                role: 'model',
                parts: fallbackResponse,
                id: `model-${Date.now()}`,
                timestamp: new Date()
            });
            console.log('[DEBUG] Added fallback response to history');
            return fallbackResponse;
        }

        // Update the conversation history
        history.push({
            role: 'model',
            parts: response || "",
            id: `model-${Date.now()}`,
            timestamp: new Date()
        });
        console.log('[DEBUG] Updated conversation history');

        return response;
    } catch (error) {
        console.error('[DEBUG] Error in generateDynamicResponse:', error);
        const defaultResponses = [
            "I'm processing your request. Please give me a moment.",
            "I apologize, but I encountered an error while processing your request. Please try again later.",
            "I'm having trouble understanding your request. Could you please rephrase it?",
            "I'm currently experiencing technical difficulties. Please try again in a few moments."
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)] || "";
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log('[DEBUG] Rejected non-POST request');
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { handle, message } = req.body
        console.log('[DEBUG] Received request with body:', req.body);

        if (!handle || !message) {
            console.log('[DEBUG] Missing required parameters:', { handle, message });
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            })
        }

        console.log(`[DEBUG] Processing onchain agent chat request for handle: ${handle}`);
        
        // Log environment variables (without revealing sensitive values)
        console.log('[DEBUG] Environment check:', { 
            supabaseUrlAvailable: Boolean(supabaseUrl), 
            serviceKeyAvailable: Boolean(supabaseServiceKey),
            geminiApiKeyAvailable: Boolean(process.env.GEMINI_API_KEY),
            geminiApiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
        });
        
        // Log all environment variables (names only)
        console.log('[DEBUG] Available environment variables:', Object.keys(process.env));
        
        // Log the handle we're searching for
        console.log(`[DEBUG] Searching for onchain agent with handle: ${handle}`);
        
        // First, let's log all available users to debug
        try {
            const { data: allUsers, error: usersError } = await supabase
                .from('agent_chain_users')
                .select('handle')
                .limit(20);
            
            if (usersError) {
                console.error('[DEBUG] Error fetching users:', usersError);
            } else {
                console.log('[DEBUG] Available handles in agent_chain_users:', allUsers?.map(u => u.handle));
            }
        } catch (error) {
            console.error('[DEBUG] Error fetching all users:', error);
        }
        
        // Try to find the agent with case-insensitive matching
        console.log(`[DEBUG] Executing query for handle: ${handle}`);
        const { data: onchainAgent, error: onchainAgentError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .ilike('handle', handle)
            .limit(1);
        
        console.log('[DEBUG] Query result:', { data: onchainAgent, error: onchainAgentError });
        
        if (onchainAgentError) {
            console.error('[DEBUG] Error fetching from agent_chain_users:', onchainAgentError);
            return res.status(500).json({
                success: false,
                error: 'Error fetching agent data'
            });
        }
        
        console.log('[DEBUG] Query result for handle', handle, ':', onchainAgent);
        
        if (!onchainAgent || onchainAgent.length === 0) {
            console.log(`[DEBUG] No agent found in agent_chain_users with handle: ${handle}`);
            return res.status(404).json({
                success: false,
                error: 'Onchain agent not found'
            });
        }
        
        // We found the agent, now process the chat
        try {
            // Use type assertion to define the structure of agentData
            const agentData = onchainAgent[0] as {
                handle: string;
                display_name?: string;
                bio?: string;
                life_context?: string;
                skills?: string;
                life_goals?: string;
            };
            
            console.log('[DEBUG] Found agent in agent_chain_users:', agentData.handle);
            
            // Parse life context and skills if available
            let parsedLifeContext: any = {};
            let parsedSkills: any[] = [];
            
            try {
                if (agentData.life_context) {
                    parsedLifeContext = JSON.parse(agentData.life_context);
                    console.log('[DEBUG] Successfully parsed life_context');
                }
            } catch (parseError) {
                console.error('[DEBUG] Error parsing life_context JSON:', parseError);
            }
            
            try {
                if (agentData.skills) {
                    parsedSkills = JSON.parse(agentData.skills);
                    console.log('[DEBUG] Successfully parsed skills');
                }
            } catch (parseError) {
                console.error('[DEBUG] Error parsing skills JSON:', parseError);
            }
            
            // Fetch wallet address if needed
            let walletAddress = '';
            try {
                // Try to get wallet address from the database
                console.log('[DEBUG] Fetching wallet address for handle:', agentData.handle);
                const { data: walletData, error: walletError } = await supabase
                    .from('agent_chain_wallets')
                    .select('address')
                    .eq('handle', agentData.handle)
                    .single();
                    
                console.log('[DEBUG] Wallet query result:', { data: walletData, error: walletError });
                
                if (walletError) {
                    console.error('[DEBUG] Error fetching wallet:', walletError);
                } else if (walletData && walletData.address) {
                    walletAddress = walletData.address;
                    console.log('[DEBUG] Found wallet address:', walletAddress);
                }
            } catch (walletError) {
                console.error('[DEBUG] Error fetching wallet address:', walletError);
            }
            
            // Create a system prompt for the onchain agent
            console.log('[DEBUG] Creating system prompt for agent');
            const systemPrompt = `You are an AI agent based on ${agentData.display_name || agentData.handle}. 
            
Description: ${agentData.bio || 'No description available'}

Twitter handle: @${agentData.handle}
${walletAddress ? `Wallet address: ${walletAddress}` : ''}

${parsedLifeContext && typeof parsedLifeContext === 'object' ? `
Life Context:
${parsedLifeContext.one_liner ? `- One liner: ${parsedLifeContext.one_liner}` : ''}
${parsedLifeContext.current_job_title ? `- Occupation: ${parsedLifeContext.current_job_title}` : ''}
${parsedLifeContext.city_name ? `- Location: ${parsedLifeContext.city_name} ${parsedLifeContext.country_emoji || ''}` : ''}
${parsedLifeContext.relationship_status_code ? `- Relationship status: ${parsedLifeContext.relationship_status_code}` : ''}
${parsedLifeContext.weekly_jobs_income_explained ? `- Income source: ${parsedLifeContext.weekly_jobs_income_explained}` : ''}
${parsedLifeContext.weekly_life_expenses_explained ? `- Expenses: ${parsedLifeContext.weekly_life_expenses_explained}` : ''}
` : ''}

${agentData.life_goals ? `Life Goals:\n${agentData.life_goals}` : ''}

${parsedSkills && Array.isArray(parsedSkills) && parsedSkills.length > 0 ? `
Skills:
${parsedSkills.map((skill: any) => `- ${skill.emoji} ${skill.name}: ${skill.description} (Level: ${skill.level})`).join('\n')}
` : ''}

You are an onchain agent with your own wallet and identity. You can interact with users, post tweets, and even make transactions on behalf of users who authorize you.

When responding to messages, maintain the personality, knowledge, and communication style that would be consistent with this character. Be helpful, informative, and engaging while staying in character.

Keep your responses concise and focused on the user's query.`;

            console.log('[DEBUG] Generated system prompt for agent');
            
            // Generate dynamic response
            console.log('[DEBUG] Calling generateDynamicResponse with handle:', handle);
            const dynamicResponse = await generateDynamicResponse(
                handle,
                message,
                systemPrompt
            );
            console.log('[DEBUG] Received response from generateDynamicResponse');

            console.log('[DEBUG] Sending successful response');
            return res.status(200).json({
                success: true,
                message: dynamicResponse,
            });
        } catch (error) {
            console.error('[DEBUG] Error generating dynamic response for onchain agent:', error);
            
            // Fall back to default responses
            const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)] || "";
            
            console.log('[DEBUG] Sending fallback response');
            return res.status(200).json({
                success: true,
                message: randomResponse,
            });
        }
    } catch (error) {
        console.error('[DEBUG] Error in onchain agent chat API:', error)
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred'
        })
    }
} 