import { NextApiRequest, NextApiResponse } from "next";
import { createAgentFromTwitterProfile, createAgentFromCharacterProfile, generateAgentResponse } from "@/lib/services/agent-training";
import { postErrorToDiscord } from "@/lib/discord";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  success: boolean;
  data: any;
  message: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, ...params } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    switch (action) {
      case "createFromTwitter": {
        const { twitterHandle } = params;
        
        if (!twitterHandle) {
          return res.status(400).json({ error: "Twitter handle is required" });
        }
        
        const agent = await createAgentFromTwitterProfile({ twitterHandle });
        
        return res.status(200).json({
          success: true,
          data: agent,
          message: `Agent created successfully from Twitter profile: ${twitterHandle}`
        });
      }
      
      case "createFromCharacter": {
        const { handle, name, description, traits, background } = params;
        
        if (!handle || !name || !description) {
          return res.status(400).json({ error: "Handle, name, and description are required" });
        }
        
        const agent = await createAgentFromCharacterProfile({
          handle,
          name,
          description,
          traits: traits || [],
          background: background || ""
        });
        
        return res.status(200).json({
          success: true,
          data: agent,
          message: `Agent created successfully from character profile: ${name}`
        });
      }
      
      case "generateResponse": {
        const { handle, prompt, systemInstructions } = params;
        
        if (!handle || !prompt) {
          return res.status(400).json({ error: "Handle and prompt are required" });
        }
        
        const response = await generateAgentResponse({
          handle,
          prompt,
          systemInstructions
        });
        
        return res.status(200).json({
          success: true,
          data: { response },
          message: `Response generated successfully from agent: ${handle}`
        });
      }
      
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("Error in agent-training API:", error);
    await postErrorToDiscord(`🔴 Error in agent-training API: ${errorMessage}`);
    
    return res.status(500).json({ error: errorMessage });
  }
} 