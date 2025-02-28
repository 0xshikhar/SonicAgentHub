import { createAgentTrainingDataset, getTwitterUserInfo, getTweetsFromUser } from "../socialData";
import { askGemini, askGeminiWithMessagesAndSystemPrompt } from "../gemini";
import { FetchedTweet } from "../types";
import { createUser, getUser, updateUser } from "../supabase-utils";
import { postErrorToDiscord } from "../discord";
import { cleanHandle, goodTwitterImage } from "../strings";

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
    
    // Create agent in database
    const newAgent = await createUser({
      handle: cleanedHandle,
      display_name: trainingDataset.profileInfo.displayName,
      profile_picture: trainingDataset.profileInfo.profileImage,
      cover_picture: "", // Default empty, could be fetched from Twitter API if available
      twitter_id: trainingDataset.profileInfo.handle,
      bio: trainingDataset.profileInfo.bio,
      life_goals: lifeGoals,
      skills: skills,
      life_context: personalityProfile,
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
      const existingAgent = await getUser(cleanedHandle);
      if (existingAgent) {
        console.log(`Agent for ${cleanedHandle} already exists`);
        return existingAgent;
      }
    } catch (error) {
      // Agent doesn't exist, continue with creation
    }
    
    // Generate personality profile based on character description
    const personalityPrompt = `
      Create a detailed personality profile for a fictional character with the following details:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Format your response as a structured personality profile that could be used to train an AI to act like this character.
      Include details about their communication style, values, interests, and typical responses to different situations.
    `;
    
    const personalityProfile = await askGemini({
      prompt: personalityPrompt,
      useCase: "character-personality-generation"
    });
    
    // Generate life goals based on character
    const lifeGoalsPrompt = `
      Based on the following character details, create appropriate life goals:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Provide a concise paragraph (3-5 sentences) describing what this character's main life goals and aspirations would be.
    `;
    
    const lifeGoals = await askGemini({
      prompt: lifeGoalsPrompt,
      useCase: "character-life-goals-generation"
    });
    
    // Generate skills based on character
    const skillsPrompt = `
      Based on the following character details, identify what skills this character would have:
      
      Name: ${name}
      Description: ${description}
      Traits: ${traits.join(', ')}
      Background: ${background}
      
      Provide a concise list of 5-10 skills this character would possess. Format as a comma-separated list.
    `;
    
    const skills = await askGemini({
      prompt: skillsPrompt,
      useCase: "character-skills-generation"
    });
    
    // Create agent in database
    const newAgent = await createUser({
      handle: cleanedHandle,
      display_name: name,
      profile_picture: "", // Default empty, would need to be set separately
      cover_picture: "", // Default empty, would need to be set separately
      twitter_id: "", // Not applicable for character profiles
      bio: description,
      life_goals: lifeGoals,
      skills: skills,
      life_context: personalityProfile,
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