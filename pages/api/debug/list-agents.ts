import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )

        // Fetch all agents from agent_chain_users table
        const { data: agents, error } = await supabase
            .from('agent_chain_users')
            .select('handle, display_name, profile_picture')
            .order('handle', { ascending: true })

        if (error) {
            console.error('Error fetching agents:', error)
            return res.status(500).json({ error: 'Error fetching agents', details: error })
        }

        return res.status(200).json({
            count: agents?.length || 0,
            agents: agents || []
        })
    } catch (error) {
        console.error('Error in list agents endpoint:', error)
        return res.status(500).json({ error: 'Internal server error', details: error })
    }
} 