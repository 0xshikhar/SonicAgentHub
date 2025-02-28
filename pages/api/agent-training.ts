import { NextApiRequest, NextApiResponse } from "next";
import { createAgentFromTwitterProfile as createRealTwitterAgent, createAgentFromCharacterProfile as createRealCharacterAgent, generateAgentResponse as generateRealAgentResponse } from "@/lib/services/agent-training";
import { fetchTwitterProfile, generateTwitterSystemPrompt, generateCharacterSystemPrompt, mockGenerateResponse } from "@/lib/services/mock-agent-service";
import { createAgentFromTwitterProfile, createAgentFromCharacterProfile, convertMainAgentToAgent, convertAgentToMainAgent } from "@/lib/agent-utils";
import { agents as staticAgents } from "@/lib/constants";
import { postErrorToDiscord } from "@/lib/discord";
import { Agent } from "@/lib/types";

interface SuccessResponse {
  success: true;
  data: any;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// In-memory storage for created agents (for demo purposes)
const dynamicAgents: Agent[] = [];

/**
 * Converts a database user to an Agent
 */
function convertDbUserToAgent(dbUser: any): Agent {
  return {
    id: dbUser.handle,
    name: dbUser.display_name || dbUser.handle,
    description: dbUser.bio || `AI agent based on ${dbUser.display_name || dbUser.handle}`,
    category: 'Social', // Default category
    chains: ['ETH', 'Polygon'],
    version: '1.0.0',
    score: 4.5,
    imageUrl: dbUser.profile_picture || '/logos/aiagent-bg.png',
    contractAddress: `0x${dbUser.handle}`,
    twitter: dbUser.twitter_id ? `@${dbUser.twitter_id}` : undefined,
    stats: {
      users: 0,
      transactions: 0,
      volume: 0,
    },
    features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { action } = req.body;

  try {
    switch (action) {
      case "createFromTwitter": {
        const { twitterHandle } = req.body;
        
        if (!twitterHandle) {
          return res.status(400).json({ success: false, error: "Twitter handle is required" });
        }
        
        try {
          // Try to use the real service first
          const dbUser = await createRealTwitterAgent({ twitterHandle });
          
          // Convert to Agent format
          const agent = convertDbUserToAgent(dbUser);
          
          // Add to dynamic agents
          dynamicAgents.push(agent);
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Agent created successfully from Twitter profile: ${twitterHandle}`
          });
        } catch (error) {
          // Fall back to mock implementation
          console.log("Falling back to mock implementation for Twitter agent creation");
          
          // Fetch Twitter profile data
          const twitterData = await fetchTwitterProfile(twitterHandle);
          
          // Create agent
          const agent = createAgentFromTwitterProfile({
            handle: twitterData.handle,
            name: twitterData.name,
            description: twitterData.description,
            profileImage: twitterData.profileImage || "/logos/twitter.png"
          });
          
          // Store in memory
          dynamicAgents.push(agent);
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Agent created successfully from Twitter profile: ${twitterHandle}`
          });
        }
      }
      
      case "createFromCharacter": {
        const { handle, name, description, traits, background } = req.body;
        
        if (!handle || !name || !description) {
          return res.status(400).json({ 
            success: false, 
            error: "Handle, name, and description are required" 
          });
        }
        
        try {
          // Try to use the real service first
          const dbUser = await createRealCharacterAgent({ 
            handle, 
            name, 
            description, 
            traits: Array.isArray(traits) ? traits : [], 
            background: background || "" 
          });
          
          // Convert to Agent format
          const agent = convertDbUserToAgent(dbUser);
          
          // Add to dynamic agents
          dynamicAgents.push(agent);
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Agent created successfully from character profile: ${name}`
          });
        } catch (error) {
          // Fall back to mock implementation
          console.log("Falling back to mock implementation for character agent creation");
          
          // Create agent
          const agent = createAgentFromCharacterProfile({
            handle,
            name,
            description,
            profileImage: `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
            traits: Array.isArray(traits) ? traits : [],
            background: background || ""
          });
          
          // Store in memory
          dynamicAgents.push(agent);
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Agent created successfully from character profile: ${name}`
          });
        }
      }
      
      case "generateResponse": {
        const { handle, prompt, systemPrompt } = req.body;
        
        if (!handle || !prompt) {
          return res.status(400).json({ 
            success: false, 
            error: "Agent handle and prompt are required" 
          });
        }
        
        try {
          // Try to use the real service first
          const response = await generateRealAgentResponse({ 
            handle, 
            prompt, 
            systemInstructions: systemPrompt 
          });
          return res.status(200).json({ 
            success: true, 
            data: { response },
            message: `Response generated successfully from agent: ${handle}`
          });
        } catch (error) {
          // Fall back to mock implementation
          console.log("Falling back to mock implementation for response generation");
          
          const response = await mockGenerateResponse(handle, prompt, systemPrompt || "");
          return res.status(200).json({ 
            success: true, 
            data: { response },
            message: `Response generated successfully from agent: ${handle}`
          });
        }
      }
      
      case "getAgents": {
        // Combine static agents from constants and dynamically created agents
        const allAgents = [...staticAgents, ...dynamicAgents];
        
        // Remove duplicates based on id
        const uniqueAgents = allAgents.filter((agent, index, self) => 
          index === self.findIndex(a => a.id === agent.id)
        );
        
        return res.status(200).json({ 
          success: true, 
          data: uniqueAgents,
          message: `Retrieved ${uniqueAgents.length} agents`
        });
      }
      
      case "getAgent": {
        const { id } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: "Agent ID is required" 
          });
        }
        
        // Search in both static and dynamic agents
        const allAgents = [...staticAgents, ...dynamicAgents];
        const agent = allAgents.find(a => a.id === id);
        
        if (!agent) {
          return res.status(404).json({ 
            success: false, 
            error: `Agent with ID ${id} not found` 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          data: agent,
          message: `Retrieved agent: ${agent.name}`
        });
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unknown action: ${action}` 
        });
    }
  } catch (error: any) {
    console.error("Error in agent-training API:", error);
    await postErrorToDiscord(`🔴 Error in agent-training API: ${error.message || "An unexpected error occurred"}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    });
  }
} 