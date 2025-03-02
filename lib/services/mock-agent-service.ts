import { Agent } from '@/lib/types'

interface TwitterData {
  handle: string
  name: string
  description: string
  profileImage?: string
  followers: number
  following: number
  tweets: string[]
}

interface CharacterData {
  handle: string
  name: string
  description: string
  traits: string[]
  background: string
}

/**
 * Fetches Twitter profile data for a given handle
 */
export async function fetchTwitterProfile(handle: string): Promise<TwitterData> {
  // In a real application, this would call the Twitter API
  // For demo purposes, we'll return mock data
  
  // Remove @ if present
  const cleanedHandle = handle.startsWith('@') ? handle.substring(1) : handle
  
  // Mock data for demo
  return {
    handle: cleanedHandle,
    name: `${cleanedHandle} (AI Agent)`,
    description: `This is an AI agent based on the Twitter profile of ${cleanedHandle}. The agent analyzes tweets and mimics the communication style.`,
    profileImage: `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
    followers: Math.floor(Math.random() * 10000),
    following: Math.floor(Math.random() * 1000),
    tweets: [
      "Just shared my thoughts on the latest market trends! #Finance #Tech",
      "Excited to announce our new partnership with a leading blockchain company!",
      "Working on something big. Stay tuned for updates!",
      "Great meeting with the team today. Innovation is at our core.",
      "What are your thoughts on the future of decentralized finance?"
    ]
  }
}

/**
 * Generates a system prompt for a Twitter-based agent
 */
export function generateTwitterSystemPrompt(twitterData: TwitterData): string {
  return `You are an AI agent based on the Twitter profile of ${twitterData.name} (@${twitterData.handle}).
  
Bio: ${twitterData.description}

You have ${twitterData.followers} followers and are following ${twitterData.following} accounts.

Recent tweets:
${twitterData.tweets.map(tweet => `- "${tweet}"`).join('\n')}

PERSONALITY INSTRUCTIONS:
- Maintain the communication style, knowledge, and personality that would be consistent with this Twitter profile
- Use a similar tone, vocabulary, and sentence structure as seen in the tweets
- Reference topics and interests that align with the Twitter profile's content
- Be concise and direct in your responses, similar to Twitter's format
- Incorporate relevant hashtags or Twitter-style formatting when appropriate
- Stay in character at all times, even when answering questions outside your typical domain
- If asked about topics not related to your expertise, respond as the Twitter personality would

When responding to messages, be helpful, informative, and engaging while staying true to the character of @${twitterData.handle}.`
}

/**
 * Generates a system prompt for a character-based agent
 */
export function generateCharacterSystemPrompt(characterData: CharacterData): string {
  return `You are an AI agent based on the character: ${characterData.name}.
  
Description: ${characterData.description}

${characterData.traits.length > 0 ? `Personality traits: ${characterData.traits.join(', ')}` : ''}
Background: ${characterData.background}

PERSONALITY INSTRUCTIONS:
- Embody the personality traits listed above in all your interactions
- Use vocabulary, expressions, and speech patterns that reflect this character
- Make references to your background story when relevant
- Express opinions and perspectives that align with your character's values
- Maintain consistent emotional responses based on your character's personality
- If asked about topics outside your character's knowledge, respond as your character would when encountering new information
- Stay in character at all times, even when answering factual questions

When responding to messages, be helpful, informative, and engaging while staying true to the character of ${characterData.name}.`
}

/**
 * Generates a response from an agent based on the provided prompt
 */
export async function mockGenerateResponse(agentId: string, prompt: string, systemPrompt: string): Promise<string> {
  // In a real application, this would call an LLM API like OpenAI
  // For demo purposes, we'll return mock responses
  
  // Log the system prompt if provided (just to use the parameter)
  if (systemPrompt) {
    console.log(`Using system prompt: ${systemPrompt}`);
  }
  
  const responses: string[] = [
    "That's an interesting question! Based on my analysis, I'd suggest exploring this further.",
    "I've been thinking about this topic recently. Here are my thoughts...",
    "Great point! I'd add that there are several factors to consider here.",
    "From my perspective, the key insight is to focus on long-term value creation.",
    "I appreciate you bringing this up. Let me share some relevant experiences.",
    "This reminds me of a recent trend I've been following. The implications are significant.",
    "I'd approach this challenge by breaking it down into manageable components.",
    "My analysis suggests that we should consider multiple perspectives on this issue."
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a random response - with a fallback in case of an error
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex] || "I'm processing your request. Please give me a moment to formulate a thoughtful response.";
} 