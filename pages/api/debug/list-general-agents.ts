import { NextApiRequest, NextApiResponse } from 'next';
import { createApiSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Creating Supabase client for debugging');
    const supabase = createApiSupabaseClient();
    
    console.log('Fetching all agents from agent_chain_general_agents table');
    const { data: agents, error } = await supabase
      .from('agent_chain_general_agents')
      .select('*');
    
    if (error) {
      console.error('Error fetching general agents:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to fetch general agents: ${error.message}`,
        details: error
      });
    }
    
    console.log(`Successfully fetched ${agents?.length || 0} general agents`);
    
    // Check if ilblackdragon exists
    const ilblackdragon = agents?.find(agent => agent.handle === 'ilblackdragon');
    
    return res.status(200).json({
      success: true,
      data: agents,
      count: agents?.length || 0,
      ilblackdragonExists: !!ilblackdragon,
      ilblackdragon: ilblackdragon || null
    });
  } catch (error: any) {
    console.error('Unexpected error in list-general-agents API:', error);
    return res.status(500).json({
      success: false,
      error: `Unexpected error: ${error.message || 'Unknown error'}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 