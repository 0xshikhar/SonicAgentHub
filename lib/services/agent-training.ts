import { createAgentTrainingDataset, getTwitterUserInfo, getTweetsFromUser } from "../socialData";
import { askGemini, askGeminiWithMessagesAndSystemPrompt } from "../gemini";
import { FetchedTweet } from "../types";
import { createUser, getUser, updateUser, createGeneralAgent, getGeneralAgentByHandle } from "../supabase-utils";
import { postErrorToDiscord } from "../discord";
import { cleanHandle, goodTwitterImage } from "../strings";
import axios from 'axios'
import { Agent } from '@/lib/types'

interface AgentTrainingOptions {
  twitterHandle?: string;
  characterProfile?: {
    name: string;
    description: string;
    traits: string[];
    background: string;
  };
  customInstructions?: string;
}

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
  background?: string
}

/**
 * Fetches Twitter profile data for a given handle
 */
async function fetchTwitterProfile(handle: string): Promise<TwitterData> {
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
function generateTwitterSystemPrompt(twitterData: TwitterData): string {
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
function generateCharacterSystemPrompt(characterData: CharacterData): string {
  return `You are an AI agent based on the character: ${characterData.name}.
  
Description: ${characterData.description}

${characterData.traits.length > 0 ? `Personality traits: ${characterData.traits.join(', ')}` : ''}
${characterData.background ? `\nBackground: ${characterData.background}` : ''}

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
 * Creates an AI agent based on a Twitter profile
 * @param options Training options including Twitter handle or character profile
 * @returns The created agent data or null if creation fails
 */
export async function createAgentFromTwitterProfile({ 
  twitterHandle 
}: { 
  twitterHandle: string 
}) {
  try {
    if (!twitterHandle) {
      throw new Error("Twitter handle is required");
    }
    
    const cleanedHandle = cleanHandle(twitterHandle);
    
    // Check if agent already exists
    try {
      const existingAgent = await getUser(cleanedHandle);
      if (existingAgent) {
        console.log(`Agent for ${cleanedHandle} already exists`);
        return existingAgent;
      }
    } catch (error) {
      // Agent doesn't exist, continue with creation
    }
    
    // Get training dataset
    const trainingDataset = await createAgentTrainingDataset(cleanedHandle);
    
    if (!trainingDataset) {
      throw new Error(`Failed to create training dataset for ${cleanedHandle}`);
    }
    
    // Generate agent personality based on tweets
    const personalityPrompt = `
      Analyze the following Twitter profile and tweet samples to create a detailed personality profile:
      
      Twitter Handle: ${trainingDataset.profileInfo.handle}
      Display Name: ${trainingDataset.profileInfo.displayName}
      Bio: ${trainingDataset.profileInfo.bio}
      
      Tweet Samples:
      ${trainingDataset.contentSamples.slice(0, 15).join('\n\n')}
      
      Based on these tweets, create a detailed personality profile including:
      1. Writing style and tone
      2. Main interests and topics
      3. Values and beliefs
      4. Communication patterns
      5. Typical responses to different situations
      6. Vocabulary and language patterns
      7. Emotional tendencies
      
      Format your response as a structured personality profile that could be used to train an AI to mimic this person's Twitter presence.
    `;
    
    const personalityProfile = await askGemini({
      prompt: personalityPrompt,
      useCase: "agent-personality-generation"
    });
    
    // Generate life goals based on tweets
    const lifeGoalsPrompt = `
      Based on the following Twitter profile and tweet samples, infer what this person's life goals might be:
      
      Twitter Handle: ${trainingDataset.profileInfo.handle}
      Display Name: ${trainingDataset.profileInfo.displayName}
      Bio: ${trainingDataset.profileInfo.bio}
      
      Tweet Samples:
      ${trainingDataset.contentSamples.slice(0, 15).join('\n\n')}
      
      Provide a concise paragraph (3-5 sentences) describing what appear to be this person's main life goals and aspirations based on their Twitter content.
    `;
    
    const lifeGoals = await askGemini({
      prompt: lifeGoalsPrompt,
      useCase: "agent-life-goals-generation"
    });
    
    // Generate skills based on tweets
    const skillsPrompt = `
      Based on the following Twitter profile and tweet samples, identify what skills this person likely has:
      
      Twitter Handle: ${trainingDataset.profileInfo.handle}
      Display Name: ${trainingDataset.profileInfo.displayName}
      Bio: ${trainingDataset.profileInfo.bio}
      
      Tweet Samples:
      ${trainingDataset.contentSamples.slice(0, 15).join('\n\n')}
      
      Provide a concise list of 5-10 skills this person likely possesses based on their Twitter content. Format as a comma-separated list.
    `;
    
    const skills = await askGemini({
      prompt: skillsPrompt,
      useCase: "agent-skills-generation"
    });
    
    // Generate a comprehensive system prompt
    const twitterData = {
      handle: cleanedHandle,
      name: trainingDataset.profileInfo.displayName,
      description: trainingDataset.profileInfo.bio,
      profileImage: trainingDataset.profileInfo.profileImage,
      followers: trainingDataset.profileInfo.followerCount || 0,
      following: trainingDataset.profileInfo.followingCount || 0,
      tweets: trainingDataset.contentSamples.slice(0, 10)
    };
    
    const systemPrompt = generateTwitterSystemPrompt(twitterData) + `\n\nAdditional personality insights:\n${personalityProfile}\n\nLife goals:\n${lifeGoals}\n\nSkills:\n${skills}`;
    
    // Create agent in database with the correct property names
    const newAgent = await createUser({
      handle: cleanedHandle,
      display_name: trainingDataset.profileInfo.displayName,
      profile_picture: trainingDataset.profileInfo.profileImage,
      cover_picture: "", // Default empty, could be fetched from Twitter API if available
      twitter_id: trainingDataset.profileInfo.handle,
      bio: trainingDataset.profileInfo.bio,
      life_goals: lifeGoals,
      skills: skills,
      life_context: `${personalityProfile}\n\nSYSTEM PROMPT:\n${systemPrompt}`,
      created_at: new Date().toISOString()
    });
    
    return newAgent;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await postErrorToDiscord(`🔴 Error creating agent from Twitter profile: ${twitterHandle}`);
    console.error("🔴 Error creating agent from Twitter profile:", error);
    throw new Error(`Failed to create agent from Twitter profile: ${errorMessage}`);
  }
}

/**
 * Creates an AI agent based on a custom character profile
 * @param options Character profile details
 * @returns The created agent data or null if creation fails
 */
export async function createAgentFromCharacterProfile({
  handle,
  name,
  description,
  traits,
  background
}: {
  handle: string;
  name: string;
  description: string;
  traits: string[];
  background: string;
}) {
  try {
    const cleanedHandle = cleanHandle(handle);
    
    // Check if agent already exists
    try {
      const existingAgent = await getGeneralAgentByHandle(cleanedHandle);
      if (existingAgent) {
        console.log(`Character agent for ${cleanedHandle} already exists`);
        return existingAgent;
      }
    } catch (error) {
      // Agent doesn't exist, continue with creation
    }
    
    // Generate personality profile based on character description
    const personalityPrompt = `
      Create a detailed personality profile for a fictional character with the following attributes:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Based on these details, create a comprehensive personality profile including:
      1. Writing style and tone
      2. Main interests and topics
      3. Values and beliefs
      4. Communication patterns
      5. Typical responses to different situations
      6. Vocabulary and language patterns
      7. Emotional tendencies
      
      Format your response as a structured personality profile that could be used to train an AI to embody this character.
    `;
    
    const personalityProfile = await askGemini({
      prompt: personalityPrompt,
      useCase: "character-personality-generation"
    });
    
    // Generate life goals based on character
    const lifeGoalsPrompt = `
      Based on the following character profile, infer what this character's life goals might be:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Provide a concise paragraph (3-5 sentences) describing what would be this character's main life goals and aspirations.
    `;
    
    const lifeGoals = await askGemini({
      prompt: lifeGoalsPrompt,
      useCase: "character-life-goals-generation"
    });
    
    // Generate skills based on character
    const skillsPrompt = `
      Based on the following character profile, identify what skills this character would likely have:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Provide a concise list of 5-10 skills this character would likely possess. Format as a comma-separated list.
    `;
    
    const skills = await askGemini({
      prompt: skillsPrompt,
      useCase: "character-skills-generation"
    });
    
    // Generate a comprehensive system prompt
    const characterData = {
      handle: cleanedHandle,
      name,
      description,
      traits,
      background
    };
    
    const systemPrompt = generateCharacterSystemPrompt(characterData) + `\n\nAdditional personality insights:\n${personalityProfile}\n\nLife goals:\n${lifeGoals}\n\nSkills:\n${skills}`;
    
    // Create agent in the general_agents table instead of users table
    const newAgent = await createGeneralAgent({
      handle: cleanedHandle,
      name: name,
      description: description,
      agent_type: 'character',
      traits: traits,
      background: background || undefined,
      system_prompt: systemPrompt,
      is_public: true,
      profile_picture: `/avatars/${Math.floor(Math.random() * 10) + 1}.png`, // Random avatar
      created_at: new Date().toISOString()
    });
    
    return newAgent;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await postErrorToDiscord(`🔴 Error creating agent from character profile: ${handle}`);
    console.error("🔴 Error creating agent from character profile:", error);
    throw new Error(`Failed to create agent from character profile: ${errorMessage}`);
  }
}

/**
 * Generates a response from an AI agent based on their training data
 * @param handle The agent's handle
 * @param prompt The user's prompt/question
 * @returns The agent's response
 */
export async function generateAgentResponse({
  handle,
  prompt,
  systemInstructions
}: {
  handle: string;
  prompt: string;
  systemInstructions?: string;
}) {
  try {
    const cleanedHandle = cleanHandle(handle);
    
    // Get agent data
    const agent = await getUser(cleanedHandle);
    
    if (!agent) {
      throw new Error(`Agent ${cleanedHandle} not found`);
    }
    
    // Create system prompt based on agent data
    let systemPrompt = systemInstructions || `
      You are ${agent.display_name} (${agent.handle}).
      
      Bio: ${agent.bio}
      
      Life Goals: ${agent.life_goals}
      
      Skills: ${agent.skills}
      
      Personality: ${agent.life_context}
      
      When responding, maintain the personality, writing style, and perspective of ${agent.display_name}.
      Use their typical tone, vocabulary, and speech patterns.
      Consider their background, values, and interests when formulating responses.
      Do not break character under any circumstances.
    `;
    
    // Generate response
    const response = await askGeminiWithMessagesAndSystemPrompt({
      messages: [
        { role: "user", content: prompt }
      ],
      systemPrompt,
      temperature: 0.7 // Higher temperature for more creative responses
    });
    
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await postErrorToDiscord(`🔴 Error generating agent response: ${handle}`);
    console.error("🔴 Error generating agent response:", error);
    throw new Error(`Failed to generate agent response: ${errorMessage}`);
  }
}

/**
 * Updates an existing AI agent with new Twitter data
 * @param handle The agent's handle
 * @returns The updated agent data
 */
export async function updateAgentFromTwitter(handle: string) {
  try {
    const cleanedHandle = cleanHandle(handle);
    
    // Get agent data
    const agent = await getUser(cleanedHandle);
    
    if (!agent) {
      throw new Error(`Agent ${cleanedHandle} not found`);
    }
    
    // Get fresh Twitter data
    const trainingDataset = await createAgentTrainingDataset(cleanedHandle);
    
    if (!trainingDataset) {
      throw new Error(`Failed to create training dataset for ${cleanedHandle}`);
    }
    
    // Update agent in database
    const updatedAgent = await updateUser(cleanedHandle, {
      profile_picture: trainingDataset.profileInfo.profileImage,
      bio: trainingDataset.profileInfo.bio
    });
    
    return updatedAgent;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await postErrorToDiscord(`🔴 Error updating agent from Twitter: ${handle}`);
    console.error("🔴 Error updating agent from Twitter:", error);
    throw new Error(`Failed to update agent from Twitter: ${errorMessage}`);
  }
} 