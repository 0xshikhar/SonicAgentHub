import { NextApiRequest, NextApiResponse } from "next"
import { postErrorToDiscord } from "@/lib/discord"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        // Extract parameters from query
        const { adminAddress } = req.query

        // Validate admin address
        if (adminAddress !== ADMIN_WALLET_ADDRESS) {
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }

        console.log('Checking environment variables')

        // List of environment variables to check
        const envVarsToCheck = [
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
            "RPC_URL",
            "DEPLOYER_WALLET_PRIVATE_KEY",
            "SOCIAL_DATA_TOOLS_API_KEY",
            "DISCORD_WEBHOOK_URL",
            "DISCORD_WEBHOOK_ERRORS_URL"
        ]

        // Check if each environment variable is set
        const envVars: Record<string, boolean> = {}
        
        envVarsToCheck.forEach(envVar => {
            envVars[envVar] = !!process.env[envVar]
        })

        // Return the status of each environment variable
        return res.status(200).json({
            success: true,
            envVars
        })
    } catch (error) {
        console.error('Error in check-env API:', error)
        await postErrorToDiscord(`Error in check-env API: ${error}`)
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
} 