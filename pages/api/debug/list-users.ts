import { NextApiRequest, NextApiResponse } from 'next';
import { createApiSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Creating Supabase client for debugging');
    const supabase = createApiSupabaseClient();
    
    console.log('Fetching all users from agent_chain_users table');
    const { data: users, error } = await supabase
      .from('agent_chain_users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to fetch users: ${error.message}`,
        details: error
      });
    }
    
    console.log(`Successfully fetched ${users?.length || 0} users`);
    
    // Check if ilblackdragon exists
    const ilblackdragon = users?.find(user => user.handle === 'ilblackdragon');
    
    return res.status(200).json({
      success: true,
      data: users,
      count: users?.length || 0,
      ilblackdragonExists: !!ilblackdragon,
      ilblackdragon: ilblackdragon || null
    });
  } catch (error: any) {
    console.error('Unexpected error in list-users API:', error);
    return res.status(500).json({
      success: false,
      error: `Unexpected error: ${error.message || 'Unknown error'}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 