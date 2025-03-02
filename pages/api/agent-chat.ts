import type { NextApiRequest, NextApiResponse } from 'next'
import { agents } from '@/lib/constants'
import { GeneralAgent, ChatMessage } from '@/lib/types'
import { getGeneralAgent, getGeneralAgentByHandle } from '@/lib/supabase-utils'
import { createApiSupabaseClient } from '@/lib/supabase'
import { askGemini } from '@/lib/gemini'

// Define an extended ChatMessage type for internal use that includes id and timestamp
interface ExtendedChatMessage extends ChatMessage {
    id: string;
    timestamp: Date;
}

// Keep mock responses as fallback
const mockResponses: Record<string, string[]> = {
    'twitter-demo': [
        "That's an interesting perspective! I've been analyzing social media trends and noticed similar patterns.",
        "Based on my Twitter analysis, I'd recommend focusing on engagement rather than just follower count.",
        "I can help you draft some tweets that align with your brand voice. What specific message are you trying to convey?",
        "The latest algorithm changes suggest that video content is being prioritized. Have you considered incorporating more video in your strategy?",
    ],
    'character-demo': [
        "As a custom character, I'm designed to provide unique insights based on my personality traits.",
        "I'd approach this situation with careful consideration of all perspectives involved.",
        "My character background gives me a unique perspective on this challenge. Let me share some thoughts...",
        "I'm programmed to think creatively about these scenarios. Have you considered an alternative approach?",
    ],
    'twitter-elonmusk': [
        "We need to think bigger! The future of humanity depends on becoming a multi-planetary species.",
        "AI is one of the most profound risks to civilization. We need to regulate it carefully.",
        "The key to innovation is questioning everything. First principles thinking is essential.",
        "Seems like a good time to launch something into space! 🚀",
    ],
    'twitter-vitalik': [
        "From a blockchain perspective, this presents interesting challenges around decentralization and scalability.",
        "Layer 2 solutions could potentially address the throughput limitations you're experiencing.",
        "The beauty of Ethereum is that it enables permissionless innovation. Anyone can build on it.",
        "We should consider the long-term social implications of these technological decisions.",
    ],
    'character-sherlock': [
        "Elementary, my dear friend. The solution becomes obvious when you eliminate the impossible.",
        "I observe that there are several clues you may have overlooked. Let me point them out...",
        "This mystery requires careful analysis of the available evidence. Let's examine the facts methodically.",
        "The game is afoot! This problem presents a fascinating intellectual challenge.",
    ],
    'character-ironman': [
        "JARVIS and I have analyzed the situation. We need a high-tech solution here.",
        "Sometimes you need to run before you can walk. Let's push the boundaries of what's possible.",
        "I've designed a new prototype that might help with this exact problem.",
        "Trust me, I'm a genius, billionaire, playboy, philanthropist. I know what I'm talking about.",
    ],
    'trading-master': [
        "Based on my technical analysis, this appears to be a key resistance level for the asset.",
        "The current market conditions suggest a cautious approach. Consider diversifying your portfolio.",
        "My algorithms have detected a potential trading opportunity in the DeFi sector.",
        "Risk management is crucial in this volatile market. I'd recommend setting appropriate stop losses.",
    ],
    'trading-crypto': [
        "The on-chain metrics for this token show increasing accumulation by whale addresses.",
        "This NFT collection has strong community engagement metrics, which often correlates with price appreciation.",
        "Layer 1 blockchains are showing increased transaction volume, which could indicate growing adoption.",
        "My analysis of market sentiment suggests a shift from bearish to neutral in the short term.",
    ],
    'social-master': [
        "Your content strategy could benefit from more consistent posting schedules across platforms.",
        "I've analyzed trending hashtags in your niche and have some recommendations for increased visibility.",
        "Engagement metrics suggest your audience responds best to interactive content like polls and questions.",
        "Cross-platform promotion can significantly increase your reach. Let me suggest some strategies.",
    ],
    'political-lincoln': [
        "A house divided against itself cannot stand. We must find common ground.",
        "With malice toward none, with charity for all, let us strive to do what is right.",
        "The best way to predict the future is to create it through thoughtful action and principled leadership.",
        "Government of the people, by the people, for the people, shall not perish from the earth.",
    ],
}

// Default responses for any agent not in the mock database
const defaultResponses = [
    "That's an interesting question! Let me think about that...",
    "I'm processing your request and analyzing the best approach.",
    "Based on my training, I'd suggest considering multiple perspectives on this issue.",
    "I'm designed to assist with these types of questions. Here's my analysis...",
]

// Store conversation history for each user-agent pair
const conversationHistory: Record<string, ExtendedChatMessage[]> = {}

/**
 * Generate a dynamic response using Gemini and the agent's system prompt
 */
async function generateDynamicResponse(
    agentId: string,
    message: string,
    systemPrompt: string
): Promise<string> {
    try {
        // Create a unique key for this user-agent conversation
        // In production, you would include a user ID as well
        const conversationKey = `agent_${agentId}`

        // Initialize conversation history if it doesn't exist
        if (!conversationHistory[conversationKey]) {
            conversationHistory[conversationKey] = []
        }

        // Add user message to history
        conversationHistory[conversationKey].push({
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date()
        })

        // Keep only the last 10 messages to avoid context length issues
        if (conversationHistory[conversationKey].length > 10) {
            conversationHistory[conversationKey] = conversationHistory[conversationKey].slice(-10)
        }

        // Instead of using askGeminiWithMessagesAndSystemPrompt which has format issues,
        // we'll use askGemini with a formatted prompt that includes the conversation history

        // Format the conversation history into a prompt
        const formattedConversation = conversationHistory[conversationKey]
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n');

        // Create a complete prompt with system instructions and conversation history
        const completePrompt = `${systemPrompt}

CONVERSATION HISTORY:
${formattedConversation}

Please respond to the user's most recent message as the AI agent, staying in character.`;

        // Generate response using Gemini
        const response = await askGemini({
            prompt: completePrompt,
            useCase: "agent-chat"
        });

        // Clean up the response if needed (remove any "Assistant:" prefix)
        const cleanedResponse = response.replace(/^(Assistant|AI|Agent):\s*/i, '').trim();

        // Add assistant response to history
        conversationHistory[conversationKey].push({
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: cleanedResponse,
            timestamp: new Date()
        });

        return cleanedResponse;
    } catch (error) {
        console.error('Error generating dynamic response:', error)
        throw error
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { handle, message } = req.body

        if (!handle || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            })
        }

        // Find the agent in static agents
        const staticAgent = agents.find(a => a.id === handle)

        if (staticAgent) {
            try {
                // Try to generate a dynamic response first
                const defaultSystemPrompt = `You are an AI agent based on ${staticAgent.name}. 
                
Description: ${staticAgent.description}

When responding to messages, maintain the personality, knowledge, and communication style that would be consistent with this character. Be helpful, informative, and engaging while staying in character.

Keep your responses concise and focused on the user's query.`

                const dynamicResponse = await generateDynamicResponse(
                    handle,
                    message,
                    defaultSystemPrompt
                )

                return res.status(200).json({
                    success: true,
                    message: dynamicResponse,
                })
            } catch (error) {
                console.error('Error generating dynamic response for static agent:', error)

                // Fall back to mock responses
                const agentResponses = mockResponses[handle] || defaultResponses
                const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

                return res.status(200).json({
                    success: true,
                    message: randomResponse,
                })
            }
        }

        // If not found in static agents, try to get from database
        try {
            console.log(`Attempting to fetch agent with handle: ${handle} for chat`);

            // Try to get from general_agents
            let generalAgent: any = null;

            try {
                // First try to get by ID
                generalAgent = await getGeneralAgent(handle);
            } catch (error) {
                console.log(`Agent not found by ID, trying to fetch by handle`);

                try {
                    // Try with the original handle
                    generalAgent = await getGeneralAgentByHandle(handle);
                } catch (handleError) {
                    console.log(`Agent not found by handle, trying with character- prefix removed`);

                    // If the handle starts with "character-", try to get by the handle part
                    if (handle && handle.startsWith('character-')) {
                        const handlePart = handle.replace('character-', '');
                        console.log(`Trying to fetch by handle part: ${handlePart}`);
                        generalAgent = await getGeneralAgentByHandle(handlePart);
                    } else {
                        throw handleError;
                    }
                }
            }

            if (generalAgent) {
                try {
                    // Map database fields to expected properties
                    const mappedAgent = {
                        id: generalAgent.id,
                        handle: generalAgent.handle,
                        name: generalAgent.name,
                        description: generalAgent.description || '',
                        agentType: generalAgent.agent_type,
                        profilePicture: generalAgent.profile_picture,
                        twitterHandle: generalAgent.twitter_handle,
                        traits: generalAgent.traits,
                        background: generalAgent.background,
                        systemPrompt: generalAgent.system_prompt,
                        createdAt: generalAgent.created_at,
                        createdBy: generalAgent.created_by,
                        isPublic: generalAgent.is_public,
                        lifeContext: generalAgent.life_context
                    };

                    // Extract system prompt from life_context if available
                    let systemPrompt = mappedAgent.systemPrompt;

                    // If no system prompt is available, check if it's embedded in life_context
                    if (!systemPrompt && mappedAgent.lifeContext && mappedAgent.lifeContext.includes('SYSTEM PROMPT:')) {
                        const systemPromptMatch = mappedAgent.lifeContext.match(/SYSTEM PROMPT:\n([\s\S]+)$/);
                        if (systemPromptMatch && systemPromptMatch[1]) {
                            systemPrompt = systemPromptMatch[1];
                        }
                    }

                    // If still no system prompt, create a default one
                    if (!systemPrompt) {
                        systemPrompt = `You are an AI agent based on ${mappedAgent.name}. 
                        
Description: ${mappedAgent.description || 'No description available'}

${mappedAgent.agentType === 'twitter' ? `Twitter handle: @${mappedAgent.twitterHandle || mappedAgent.handle}` : ''}
${mappedAgent.traits && mappedAgent.traits.length > 0 ? `Personality traits: ${mappedAgent.traits.join(', ')}` : ''}
${mappedAgent.background ? `Background: ${mappedAgent.background}` : ''}

When responding to messages, maintain the personality, knowledge, and communication style that would be consistent with this character. Be helpful, informative, and engaging while staying in character.

Keep your responses concise and focused on the user's query.`;
                    }

                    // Generate dynamic response
                    const dynamicResponse = await generateDynamicResponse(
                        handle,
                        message,
                        systemPrompt
                    )

                    return res.status(200).json({
                        success: true,
                        message: dynamicResponse,
                    })
                } catch (error) {
                    console.error('Error generating dynamic response for database agent:', error)

                    // Fall back to mock responses based on agent type
                    const agentType = generalAgent.agent_type;
                    let responsePool;

                    if (agentType === 'twitter') {
                        responsePool = mockResponses['twitter-demo'] || defaultResponses;
                    } else {
                        responsePool = mockResponses['character-demo'] || defaultResponses;
                    }

                    const randomResponse = responsePool[Math.floor(Math.random() * responsePool.length)];

                    return res.status(200).json({
                        success: true,
                        message: randomResponse,
                    });
                }
            }
        } catch (dbError) {
            console.error('Error fetching agent from database:', dbError);
        }

        // If we get here, the agent was not found
        return res.status(404).json({
            success: false,
            error: 'Agent not found'
        })
    } catch (error) {
        console.error('Error in agent chat API:', error)
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred'
        })
    }
} 