import { NextApiRequest, NextApiResponse } from "next";
import { createAgentFromTwitterProfile as createRealTwitterAgent, createAgentFromCharacterProfile as createRealCharacterAgent, generateAgentResponse as generateRealAgentResponse } from "@/lib/services/agent-training";
import { fetchTwitterProfile, generateTwitterSystemPrompt, generateCharacterSystemPrompt, mockGenerateResponse } from "@/lib/services/mock-agent-service";
import { createAgentFromTwitterProfile, createAgentFromCharacterProfile, convertMainAgentToAgent, convertAgentToMainAgent } from "@/lib/agent-utils";
import { agents as staticAgents } from "@/lib/constants";
import { postErrorToDiscord } from "@/lib/discord";
import { Agent, GeneralAgent } from "@/lib/types";
import { createGeneralAgent, getGeneralAgent, listGeneralAgents } from "@/lib/supabase-utils";
import type { Json } from "@/types/supabase";

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

  const { action, agentId } = req.body;

  try {
    switch (action) {
      case "createFromTwitter": {
        const { twitterHandle } = req.body;
        
        if (!twitterHandle) {
          return res.status(400).json({ success: false, error: "Twitter handle is required" });
        }
        
        try {
          // Try to use the real service first for onchain agents
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
          // Fall back to creating a general agent
          console.log("Creating general agent for Twitter profile");
          
          try {
            // Fetch Twitter profile data
            const twitterData = await fetchTwitterProfile(twitterHandle);
            
            // Generate system prompt
            const systemPrompt = generateTwitterSystemPrompt(twitterData);
            
            console.log("Twitter data fetched:", twitterData);
            console.log("System prompt generated:", systemPrompt);
            
            // Create general agent
            const generalAgentData = {
              handle: twitterData.handle,
              name: twitterData.name,
              description: twitterData.description,
              agent_type: 'twitter',
              profile_picture: twitterData.profileImage,
              twitter_handle: twitterData.handle,
              system_prompt: systemPrompt,
              is_public: true,
              created_by: req.body.createdBy ? Number(req.body.createdBy) : undefined
            };
            
            console.log("Attempting to create general agent with data:", generalAgentData);
            
            const generalAgent = await createGeneralAgent(generalAgentData);
            
            console.log("General agent created successfully:", generalAgent);
            
            // Convert to Agent format for frontend
            const agent = createAgentFromTwitterProfile({
              handle: generalAgent.handle,
              name: generalAgent.name,
              description: generalAgent.description || "",
              profileImage: generalAgent.profile_picture || "/logos/twitter.png"
            });
            
            // Store in memory for current session
            dynamicAgents.push(agent);
            
            return res.status(200).json({ 
              success: true, 
              data: agent,
              message: `Agent created successfully from Twitter profile: ${twitterHandle}`
            });
          } catch (innerError: any) {
            console.error("Error creating general agent:", innerError);
            await postErrorToDiscord(`Error creating general agent: ${innerError.message || "Unknown error"}`);
            return res.status(500).json({ 
              success: false, 
              error: `Failed to create agent: ${innerError.message || "Unknown error"}` 
            });
          }
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
          // Try to use the real service first for onchain agents
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
          // Fall back to creating a general agent
          console.log("Creating general agent for character profile");
          
          // Format traits for storage
          const traitsArray = Array.isArray(traits) 
            ? traits 
            : typeof traits === 'string' 
              ? traits.split(',').map(t => t.trim())
              : [];
          
          // Generate system prompt
          const characterData = {
            handle,
            name,
            description,
            traits: traitsArray,
            background: background || ""
          };
          const systemPrompt = generateCharacterSystemPrompt(characterData);
          
          // Create general agent
          const generalAgent = await createGeneralAgent({
            handle,
            name,
            description,
            agent_type: 'character',
            traits: traitsArray,
            background: background || undefined,
            system_prompt: systemPrompt,
            is_public: true,
            created_by: req.body.createdBy ? Number(req.body.createdBy) : undefined
          });
          
          // Convert to Agent format for frontend
          const agent = createAgentFromCharacterProfile({
            handle: generalAgent.handle,
            name: generalAgent.name,
            description: generalAgent.description || "",
            profileImage: `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
            traits: traitsArray,
            background: background || ""
          });
          
          // Store in memory for current session
          dynamicAgents.push(agent);
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Agent created successfully from character profile: ${name}`
          });
        }
      }
      
      case "createOnchainAgentRequest": {
        const { email, walletAddress, agentType, details } = req.body;
        
        if (!email || !walletAddress || !agentType || !details) {
          return res.status(400).json({ 
            success: false, 
            error: "Email, wallet address, agent type, and details are required" 
          });
        }
        
        // Here you would typically store this request in a database
        // and notify administrators to review it
        
        // For now, we'll just return a success message
        await postErrorToDiscord(`🔵 New onchain agent request: ${email} (${walletAddress}) - Type: ${agentType}`);
        
        return res.status(200).json({ 
          success: true, 
          data: { email, walletAddress, agentType, details },
          message: "Your request has been submitted and will be reviewed by our team."
        });
      }
      
      case "getGeneralAgents": {
        const { limit, agentType } = req.body;
        
        const generalAgents = await listGeneralAgents(
          limit || 20, 
          agentType === 'twitter' || agentType === 'character' ? agentType : undefined
        );
        
        // Convert to Agent format for frontend
        const agents = generalAgents.map(ga => {
          if (ga.agent_type === 'twitter') {
            return createAgentFromTwitterProfile({
              handle: ga.handle,
              name: ga.name,
              description: ga.description || "",
              profileImage: ga.profile_picture || "/logos/twitter.png"
            });
          } else {
            // Handle traits properly based on its type
            let traitsArray: string[] = [];
            if (typeof ga.traits === 'string') {
              traitsArray = ga.traits.split(',').map(t => t.trim());
            } else if (Array.isArray(ga.traits)) {
              traitsArray = ga.traits.map(t => String(t));
            }
            
            return createAgentFromCharacterProfile({
              handle: ga.handle,
              name: ga.name,
              description: ga.description || "",
              profileImage: ga.profile_picture || `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
              traits: traitsArray,
              background: ga.background || ""
            });
          }
        });
        
        return res.status(200).json({ 
          success: true, 
          data: agents,
          message: `Retrieved ${agents.length} general agents`
        });
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
            message: "Response generated successfully"
          });
        } catch (error) {
          console.log("Falling back to mock response generation");
          
          try {
            // Try to get the general agent first
            const generalAgent = await getGeneralAgent(handle);
            
            // Generate a response using the agent's system prompt
            const response = await mockGenerateResponse(
              handle,
              prompt, 
              generalAgent.system_prompt || systemPrompt || ""
            );
            
            return res.status(200).json({ 
              success: true, 
              data: { response },
              message: "Response generated successfully (mock)"
            });
          } catch (innerError) {
            // If we can't find the general agent, just use the provided system prompt
            const response = await mockGenerateResponse(
              handle,
              prompt, 
              systemPrompt || ""
            );
            
            return res.status(200).json({ 
              success: true, 
              data: { response },
              message: "Response generated successfully (mock, fallback)"
            });
          }
        }
      }
      
      case "getAgent": {
        // First check if it's a static agent
        const staticAgent = staticAgents.find(a => a.id === agentId);
        if (staticAgent) {
          return res.status(200).json({ 
            success: true, 
            data: staticAgent,
            message: `Retrieved static agent: ${staticAgent.name}`
          });
        }
        
        // Then check if it's a dynamic agent
        const dynamicAgent = dynamicAgents.find(a => a.id === agentId);
        if (dynamicAgent) {
          return res.status(200).json({ 
            success: true, 
            data: dynamicAgent,
            message: `Retrieved dynamic agent: ${dynamicAgent.name}`
          });
        }
        
        // Finally, try to get it from the database
        try {
          const generalAgent = await getGeneralAgent(agentId);
          
          // Convert to Agent format
          let agent: Agent;
          
          if (generalAgent.agent_type === 'twitter') {
            agent = createAgentFromTwitterProfile({
              handle: generalAgent.handle,
              name: generalAgent.name,
              description: generalAgent.description || "",
              profileImage: generalAgent.profile_picture || "/logos/twitter.png"
            });
          } else {
            // Handle traits properly based on its type
            let traitsArray: string[] = [];
            if (typeof generalAgent.traits === 'string') {
              traitsArray = generalAgent.traits.split(',').map(t => t.trim());
            } else if (Array.isArray(generalAgent.traits)) {
              traitsArray = generalAgent.traits.map(t => String(t));
            }
            
            agent = createAgentFromCharacterProfile({
              handle: generalAgent.handle,
              name: generalAgent.name,
              description: generalAgent.description || "",
              profileImage: generalAgent.profile_picture || `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
              traits: traitsArray,
              background: generalAgent.background || ""
            });
          }
          
          return res.status(200).json({ 
            success: true, 
            data: agent,
            message: `Retrieved general agent: ${agent.name}`
          });
        } catch (error) {
          return res.status(404).json({ 
            success: false, 
            error: `Agent not found: ${agentId}` 
          });
        }
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unknown action: ${action}` 
        });
    }
  } catch (error: any) {
    console.error("Error in agent-training API:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "An unknown error occurred" 
    });
  }
} 