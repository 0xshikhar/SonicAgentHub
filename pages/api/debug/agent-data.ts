import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getWalletByHandle } from '@/lib/supabase-db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { handle } = req.query

    console.log('Debug agent-data endpoint called with handle:', handle)

    if (!handle || typeof handle !== 'string') {
        return res.status(400).json({ error: 'Handle is required' })
    }

    try {
        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )

        // Fetch agent details from agent_chain_users table
        const { data: agentData, error } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', handle)
            .single()

        if (error) {
            console.error('Error fetching agent by handle:', error)
            return res.status(404).json({ error: 'Agent not found', details: error })
        }

        // Fetch wallet information
        const walletData = await getWalletByHandle(handle)

        return res.status(200).json({
            agent: agentData,
            wallet: walletData ? {
                address: walletData.address,
                exists: !!walletData
            } : null
        })
    } catch (error) {
        console.error('Error in debug endpoint:', error)
        return res.status(500).json({ error: 'Internal server error', details: error })
    }
} 