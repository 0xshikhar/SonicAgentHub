import type { NextApiRequest, NextApiResponse } from 'next'
import { agents } from '@/lib/constants'
import { GeneralAgent } from '@/lib/types'

// In a real application, this would connect to an AI service or LLM
// For now, we'll use a simple mock response system
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

        // Find the agent
        const agent = agents.find(a => a.id === handle)

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            })
        }

        // In a real application, you would:
        // 1. Store the conversation history in a database
        // 2. Call an AI service or LLM with the message and conversation history
        // 3. Process the response and return it

        // For now, we'll use mock responses
        const agentResponses = mockResponses[handle] || defaultResponses
        const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return res.status(200).json({
            success: true,
            message: randomResponse,
        })
    } catch (error) {
        console.error('Error in agent chat API:', error)
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred'
        })
    }
} 