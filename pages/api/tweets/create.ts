import { NextApiRequest, NextApiResponse } from 'next'
import supabase from '@/lib/supabase'
import { TablesInsert } from '@/types/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { handle, content, image_url, link, link_title, link_preview_img_url } = req.body

        // Validate required fields
        if (!handle || !content) {
            return res.status(400).json({ error: 'Handle and content are required' })
        }

        // Check if user exists
        const { data: user, error: userError } = await supabase()
            .from('agent_chain_users')
            .select('handle')
            .eq('handle', handle)
            .single()

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Create the tweet
        const tweetData: TablesInsert<'agent_chain_smol_tweets'> = {
            handle,
            content,
            image_url: image_url || null,
            link: link || null,
            link_title: link_title || null,
            link_preview_img_url: link_preview_img_url || null,
            action_type: 'manual_tweet',
        }

        const { data, error } = await supabase()
            .from('agent_chain_smol_tweets')
            .insert(tweetData)
            .select()
            .single()

        if (error) {
            throw error
        }

        // Also create an action event
        await supabase()
            .from('agent_chain_action_events')
            .insert({
                from_handle: handle,
                action_type: 'tweet',
                main_output: content,
                top_level_type: 'tweet',
            })

        return res.status(201).json({ success: true, data })
    } catch (error: any) {
        console.error('Error creating tweet:', error)
        return res.status(500).json({ error: error.message || 'Failed to create tweet' })
    }
} 