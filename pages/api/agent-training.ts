import { NextApiRequest, NextApiResponse } from "next";
import { createAgentFromTwitterProfile as createRealTwitterAgent, createAgentFromCharacterProfile as createRealCharacterAgent, generateAgentResponse as generateRealAgentResponse } from "@/lib/services/agent-training";
import { fetchTwitterProfile, generateTwitterSystemPrompt, generateCharacterSystemPrompt, mockGenerateResponse } from "@/lib/services/mock-agent-service";
import { createAgentFromTwitterProfile, createAgentFromCharacterProfile, convertMainAgentToAgent, convertAgentToMainAgent } from "@/lib/agent-utils";
import { agents as staticAgents } from "@/lib/constants";
import { postErrorToDiscord } from "@/lib/discord";
import { Agent, GeneralAgent } from "@/lib/types";
import { createGeneralAgent, getGeneralAgent, listGeneralAgents, getGeneralAgentByHandle } from "@/lib/supabase-utils";
import type { Json } from "@/types/supabase";
import { createApiSupabaseClient } from "@/lib/supabase"; // Import the API client creator instead of the default client

interface SuccessResponse {
  success: true;
  data: any;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// Union type for API responses
type ApiResponse = SuccessResponse | ErrorResponse;

// In-memory store for dynamic agents (will be lost on server restart)
const dynamicAgents: Agent[] = [];

// Helper function to convert DB user to Agent format
function convertDbUserToAgent(dbUser: any): Agent {
  return {
    id: dbUser.handle,
    name: dbUser.display_name || dbUser.handle,
    description: dbUser.bio || "",
    category: 'Social',
    chains: ['ETH', 'Polygon'],
    version: '1.0.0',
    score: 4.5,
    imageUrl: dbUser.profile_picture || "/logos/twitter.png",
    contractAddress: `0x${dbUser.handle}`,
    twitter: `@${dbUser.handle}`,
    stats: {
      users: 0,
      transactions: 0,
      volume: 0,
    },
    features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation']
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { action, agentId } = req.body;
  console.log(`🔄 agent-training API: Processing action: ${action}`);

  try {
    // Create a Supabase client that can bypass RLS for API routes
    const supabase = createApiSupabaseClient();
    
    switch (action) {
      case "createFromTwitter": {
        const { twitterHandle } = req.body;
        
        if (!twitterHandle) {
          return res.status(400).json({ success: false, error: "Twitter handle is required" });
        }
        
        console.log(`🔄 agent-training API: Creating agent from Twitter handle: ${twitterHandle}`);
        
        try {
          // Try to use the real service first for onchain agents
          const dbUser = await createRealTwitterAgent({ twitterHandle });
          
          // Convert to Agent format
          const agent = convertDbUserToAgent(dbUser);
          
          // Add to dynamic agents
          dynamicAgents.push(agent);
          
          console.log(`✅ agent-training API: Successfully created agent from Twitter profile: ${twitterHandle}`);
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
            
            try {
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
            } catch (supabaseError) {
              console.error("Error creating general agent in Supabase:", supabaseError);
              
              // Try direct Supabase client as a last resort
              try {
                console.log("Attempting to create general agent with direct Supabase client");
                const { data, error } = await supabase
                  .from('agent_chain_general_agents')
                  .insert(generalAgentData)
                  .select()
                  .single();
                
                if (error) throw error;
                
                console.log("General agent created successfully with direct client:", data);
                
                // Convert to Agent format for frontend
                const agent = createAgentFromTwitterProfile({
                  handle: data.handle,
                  name: data.name,
                  description: data.description || "",
                  profileImage: data.profile_picture || "/logos/twitter.png"
                });
                
                // Store in memory for current session
                dynamicAgents.push(agent);
                
                return res.status(200).json({ 
                  success: true, 
                  data: agent,
                  message: `Agent created successfully from Twitter profile: ${twitterHandle}`
                });
              } catch (directError) {
                console.error("Error with direct Supabase client:", directError);
                throw directError;
              }
            }
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
          // Use the createRealCharacterAgent function which now creates in the general_agents table
          const dbUser = await createRealCharacterAgent({
            handle, 
            name, 
            description, 
            traits: Array.isArray(traits) ? traits : [], 
            background: background || "" 
          });
          
          // Convert to Agent format
          const agent = {
            id: dbUser.handle,
            name: dbUser.name,
            description: dbUser.description || "",
            category: 'Social' as const,
            chains: ['ETH', 'Polygon'],
            version: '1.0.0',
            score: 4.5,
            imageUrl: dbUser.profile_picture || "/logos/aiagent-bg.png",
            contractAddress: `0x${dbUser.handle}`,
            stats: {
              users: 0,
              transactions: 0,
              volume: 0,
            },
            features: ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
            agentType: 'character' as const,
            source: 'general_agents' as const
          };
          
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
          try {
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
            
            // Add source and agent type information
            agent.agentType = 'character';
            agent.source = 'general_agents';
            
            // Store in memory for current session
            dynamicAgents.push(agent);
            
            return res.status(200).json({ 
              success: true, 
              data: agent,
              message: `Agent created successfully from character profile: ${name}`
            });
          } catch (supabaseError) {
            console.error("Error creating character agent in Supabase:", supabaseError);
            
            // Try direct Supabase client as a last resort
            try {
              console.log("Attempting to create character agent with direct Supabase client");
              const { data, error } = await supabase
                .from('agent_chain_general_agents')
                .insert({
                  handle,
                  name,
                  description,
                  agent_type: 'character',
                  traits: traitsArray,
                  background: background || undefined,
                  system_prompt: systemPrompt,
                  is_public: true,
                  created_by: req.body.createdBy ? Number(req.body.createdBy) : undefined
                })
                .select()
                .single();
              
              if (error) throw error;
              
              console.log("Character agent created successfully with direct client:", data);
              
              // Convert to Agent format for frontend
              const agent = createAgentFromCharacterProfile({
                handle: data.handle,
                name: data.name,
                description: data.description || "",
                profileImage: `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
                traits: traitsArray,
                background: background || ""
              });
              
              // Add source and agent type information
              agent.agentType = 'character';
              agent.source = 'general_agents';
              
              // Store in memory for current session
              dynamicAgents.push(agent);
              
              return res.status(200).json({ 
                success: true, 
                data: agent,
                message: `Agent created successfully from character profile: ${name}`
              });
            } catch (directError) {
              console.error("Error with direct Supabase client:", directError);
              throw directError;
            }
          }
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
        console.log("Fetching general agents from all sources");
        
        try {
          // Create a Supabase client that can bypass RLS
          const supabase = createApiSupabaseClient();
          
          // 1. Fetch agents from agent_chain_general_agents table
          const { data: generalAgents, error: generalAgentsError } = await supabase
            .from('agent_chain_general_agents')
            .select('*')
            .eq('is_public', true);
          
          if (generalAgentsError) {
            console.error("Error fetching general agents:", generalAgentsError);
            throw generalAgentsError;
          }
          
          // 2. Fetch agents from agent_chain_users table (Twitter-based agents)
          const { data: userAgents, error: userAgentsError } = await supabase
            .from('agent_chain_users')
            .select('*');
          
          if (userAgentsError) {
            console.error("Error fetching user agents:", userAgentsError);
            throw userAgentsError;
          }
          
          // 3. Convert general agents to Agent format
          const formattedGeneralAgents = generalAgents?.map(agent => {
            return {
              id: agent.handle,
              name: agent.name,
              description: agent.description || "",
              category: agent.agent_type === 'twitter' ? 'Social' : 'Character',
              chains: ['ETH', 'Polygon'],
              version: '1.0.0',
              score: 4.5,
              imageUrl: agent.profile_picture || "/logos/aiagent-bg.png",
              contractAddress: `0x${agent.handle}`,
              twitter: agent.agent_type === 'twitter' ? `@${agent.twitter_handle || agent.handle}` : undefined,
              stats: {
                users: 0,
                transactions: 0,
                volume: 0,
              },
              features: agent.agent_type === 'twitter' 
                ? ['Twitter Analysis', 'Personality Mirroring', 'Content Generation']
                : ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
              agentType: agent.agent_type,
              source: 'general_agents'
            };
          }) || [];
          
          // 4. Convert user agents to Agent format
          const formattedUserAgents = userAgents?.map(user => {
            return {
              id: user.handle,
              name: user.display_name || user.handle,
              description: user.bio || "",
              category: 'Social',
              chains: ['ETH', 'Polygon'],
              version: '1.0.0',
              score: 4.5,
              imageUrl: user.profile_picture || "/logos/twitter.png",
              contractAddress: `0x${user.handle}`,
              twitter: `@${user.handle}`,
              stats: {
                users: 0,
                transactions: 0,
                volume: 0,
              },
              features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
              agentType: 'twitter',
              source: 'agent_chain_users'
            };
          }) || [];
          
          // 5. Combine all agents
          const allAgents = [...formattedGeneralAgents, ...formattedUserAgents];
          
          // 6. Add dynamic agents from memory
          const combinedAgents = [...allAgents, ...dynamicAgents];
          
          return res.status(200).json({
            success: true,
            data: combinedAgents,
            message: "Successfully fetched agents from all sources"
          });
        } catch (error: any) {
          console.error("Error in getGeneralAgents:", error);
          return res.status(500).json({
            success: false,
            error: `Failed to fetch agents: ${error.message || "Unknown error"}`
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
        const { handle } = req.body; // Extract handle if provided
        
        // First check if it's a static agent
        const staticAgent = staticAgents.find(a => a.id === agentId);
        if (staticAgent) {
          return res.status(200).json({ 
            success: true, 
            data: {
              ...staticAgent,
              source: 'local'
            },
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
        
        // Check if the agentId starts with "character-" and try to find it in dynamic agents
        if (agentId && agentId.startsWith('character-')) {
          const handlePart = agentId.replace('character-', '');
          const dynamicAgentByHandle = dynamicAgents.find(a => a.id === handlePart);
          
          if (dynamicAgentByHandle) {
            return res.status(200).json({ 
              success: true, 
              data: dynamicAgentByHandle,
              message: `Retrieved dynamic agent by handle part: ${dynamicAgentByHandle.name}`
            });
          }
        }
        
        // Finally, try to get it from the database
        try {
          console.log(`Attempting to fetch agent with ID: ${agentId}`);
          
          // Create a Supabase client that can bypass RLS
          const supabase = createApiSupabaseClient();
          
          // If the agentId starts with "character-", try to get by the handle part first
          if (agentId && agentId.startsWith('character-')) {
            const handlePart = agentId.replace('character-', '');
            console.log(`Agent ID starts with character-, trying to fetch by handle part: ${handlePart}`);
            
            try {
              // Try to get from agent_chain_general_agents table
              const { data: generalAgent, error: generalAgentError } = await supabase
                .from('agent_chain_general_agents')
                .select('*')
                .eq('handle', handlePart)
                .single();
              
              if (generalAgentError) throw generalAgentError;
              
              // Convert to Agent format
              let agent: Agent;
              
              if (generalAgent.agent_type === 'twitter') {
                agent = createAgentFromTwitterProfile({
                  handle: generalAgent.handle,
                  name: generalAgent.name,
                  description: generalAgent.description || "",
                  profileImage: generalAgent.profile_picture || "/logos/twitter.png"
                });
                
                // Add source information
                agent = {
                  ...agent,
                  agentType: 'twitter',
                  source: 'general_agents'
                };
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
                
                // Add source information
                agent = {
                  ...agent,
                  agentType: 'character',
                  source: 'general_agents'
                };
              }
              
              return res.status(200).json({ 
                success: true, 
                data: agent,
                message: `Retrieved general agent by handle part: ${agent.name}`
              });
            } catch (handlePartError) {
              console.log(`Failed to fetch by handle part, continuing with normal flow: ${handlePartError}`);
              // Continue with normal flow
            }
          }
          
          // Try to get from general_agents first using the helper functions
          try {
            // First try to get by ID
            let generalAgent;
            try {
              generalAgent = await getGeneralAgent(agentId);
            } catch (error) {
              console.log(`Agent not found by ID, trying to fetch by handle: ${handle || agentId}`);
              
              try {
                // Try with the original handle
                generalAgent = await getGeneralAgentByHandle(handle || agentId);
              } catch (handleError) {
                console.log(`Agent not found by handle, trying with character- prefix removed`);
                
                // If the ID starts with "character-", try to get by the handle part
                if (agentId && agentId.startsWith('character-')) {
                  const handlePart = agentId.replace('character-', '');
                  console.log(`Trying to fetch by handle part: ${handlePart}`);
                  generalAgent = await getGeneralAgentByHandle(handlePart);
                } else if (handle && handle.startsWith('character-')) {
                  const handlePart = handle.replace('character-', '');
                  console.log(`Trying to fetch by handle part: ${handlePart}`);
                  generalAgent = await getGeneralAgentByHandle(handlePart);
                } else {
                  throw handleError;
                }
              }
            }
            
            // Convert to Agent format
            let agent: Agent;
            
            if (generalAgent.agent_type === 'twitter') {
              agent = createAgentFromTwitterProfile({
                handle: generalAgent.handle,
                name: generalAgent.name,
                description: generalAgent.description || "",
                profileImage: generalAgent.profile_picture || "/logos/twitter.png"
              });
              
              // Add source information
              agent = {
                ...agent,
                agentType: 'twitter',
                source: 'general_agents'
              };
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
              
              // Add source information
              agent = {
                ...agent,
                agentType: 'character',
                source: 'general_agents'
              };
            }
            
            return res.status(200).json({ 
              success: true, 
              data: agent,
              message: `Retrieved general agent: ${agent.name}`
            });
          } catch (generalAgentError) {
            console.log("Agent not found in general_agents, trying agent_chain_users");
            
            // If not found in general_agents, try agent_chain_users
            try {
              // Create a Supabase client that can bypass RLS
              const supabase = createApiSupabaseClient();
              
              const { data: userAgent, error: userAgentError } = await supabase
                .from('agent_chain_users')
                .select('*')
                .eq('handle', agentId)
                .single();
              
              if (userAgentError) throw userAgentError;
              
              // Convert to Agent format
              const agent = {
                id: userAgent.handle,
                name: userAgent.display_name || userAgent.handle,
                description: userAgent.bio || "",
                category: 'Social',
                chains: ['ETH', 'Polygon'],
                version: '1.0.0',
                score: 4.5,
                imageUrl: userAgent.profile_picture || "/logos/twitter.png",
                contractAddress: `0x${userAgent.handle}`,
                twitter: `@${userAgent.handle}`,
                stats: {
                  users: 0,
                  transactions: 0,
                  volume: 0,
                },
                features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
                agentType: 'twitter',
                source: 'agent_chain_users'
              };
              
              return res.status(200).json({ 
                success: true, 
                data: agent,
                message: `Retrieved user agent: ${agent.name}`
              });
            } catch (userAgentError) {
              console.error("Agent not found in agent_chain_users either:", userAgentError);
              throw new Error(`Agent not found: ${agentId}`);
            }
          }
        } catch (error) {
          console.error(`Error fetching agent ${agentId}:`, error);
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