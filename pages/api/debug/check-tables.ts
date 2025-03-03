import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )

        // Check specific tables
        const tableChecks = await Promise.all([
            supabase.from('agent_chain_users').select('count', { count: 'exact', head: true }),
            supabase.from('agent_chain_wallets').select('count', { count: 'exact', head: true }),
            supabase.from('agent_chain_action_events').select('count', { count: 'exact', head: true }),
            supabase.from('agent_chain_saved_tweets').select('count', { count: 'exact', head: true })
        ])

        // Check for testhandle789
        const { data: testAgent, error: testAgentError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', 'testhandle789')

        return res.status(200).json({
            counts: {
                agent_chain_users: tableChecks[0].count || 0,
                agent_chain_wallets: tableChecks[1].count || 0,
                agent_chain_action_events: tableChecks[2].count || 0,
                agent_chain_saved_tweets: tableChecks[3].count || 0
            },
            errors: {
                agent_chain_users: tableChecks[0].error,
                agent_chain_wallets: tableChecks[1].error,
                agent_chain_action_events: tableChecks[2].error,
                agent_chain_saved_tweets: tableChecks[3].error
            },
            testAgent: {
                found: testAgent && testAgent.length > 0,
                data: testAgent,
                error: testAgentError
            }
        })
    } catch (error) {
        console.error('Error in check tables endpoint:', error)
        return res.status(500).json({ error: 'Internal server error', details: error })
    }
} 