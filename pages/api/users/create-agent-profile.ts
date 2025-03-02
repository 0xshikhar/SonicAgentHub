import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from '@/lib/supabase'
import type { TablesInsert } from '@/types/supabase'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { address, displayName, lifeContext, lifeGoals, skills } = req.body

        if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
            return res.status(400).json({ error: 'Invalid wallet address' })
        }

        console.log(`[API] Creating agent profile for end user with address: ${address}`)

        // First check if end user exists
        const { data: existingUser, error: fetchError } = await supabase()
            .from('agent_chain_end_users')
            .select('*')
            .eq('address', address)
            .single()

        if (fetchError) {
            console.error(`[API] Error fetching end user: ${fetchError.message}`, fetchError)
            return res.status(500).json({ error: `Error fetching end user: ${fetchError.message}` })
        }

        if (!existingUser) {
            console.error(`[API] End user not found for address: ${address}`)
            return res.status(404).json({ error: 'End user not found' })
        }

        // Check if user already has an agent profile
        const { data: existingProfile, error: profileError } = await supabase()
            .from('agent_chain_users')
            .select('*')
            .eq('creator', address)
            .maybeSingle()

        if (profileError && profileError.code !== 'PGRST116') {
            console.error(`[API] Error checking for existing profile: ${profileError.message}`, profileError)
            return res.status(500).json({ error: `Error checking for existing profile: ${profileError.message}` })
        }

        if (existingProfile) {
            console.log(`[API] User already has an agent profile with handle: ${existingProfile.handle}`)
            return res.status(200).json(existingProfile)
        }

        // Create a new agent profile
        const handle = `user_${address.slice(2, 8).toLowerCase()}`
        const userData: TablesInsert<'agent_chain_users'> = {
            handle,
            display_name: displayName || `User ${address.slice(0, 6)}`,
            life_context: lifeContext || '',
            life_goals: lifeGoals || '',
            skills: skills || '',
            creator: address, // Link to the end user
        }

        const { data: newProfile, error: createError } = await supabase()
            .from('agent_chain_users')
            .insert(userData)
            .select()
            .single()

        if (createError) {
            console.error(`[API] Error creating agent profile: ${createError.message}`, createError)
            return res.status(500).json({ error: `Error creating agent profile: ${createError.message}` })
        }

        console.log(`[API] Successfully created agent profile with handle: ${newProfile.handle}`)

        // Create a wallet for the new agent profile
        try {
            const walletData: TablesInsert<'agent_chain_wallets'> = {
                handle: newProfile.handle,
                address,
                private_key: 'demo-private-key', // In a real app, you'd use a secure method to store private keys
                permit_signature: 'demo-signature', // Adding the missing required field
            }

            const { error: walletError } = await supabase()
                .from('agent_chain_wallets')
                .insert(walletData)

            if (walletError) {
                console.error(`[API] Error creating wallet for agent: ${walletError.message}`, walletError)
                // Don't return an error, just log it - the profile was created successfully
            } else {
                console.log(`[API] Successfully created wallet for agent: ${newProfile.handle}`)
            }
        } catch (walletError) {
            console.error(`[API] Unexpected error creating wallet: ${walletError}`)
            // Don't return an error, just log it - the profile was created successfully
        }

        // Update the end user to indicate they have created an agent
        try {
            const { error: updateError } = await supabase()
                .from('agent_chain_end_users')
                .update({ agentCreated: true })
                .eq('address', address)

            if (updateError) {
                console.error(`[API] Error updating end user: ${updateError.message}`, updateError)
                // Don't return an error, just log it - the profile was created successfully
            } else {
                console.log(`[API] Successfully updated end user to indicate agent created: ${address}`)
            }
        } catch (updateError) {
            console.error(`[API] Unexpected error updating end user: ${updateError}`)
            // Don't return an error, just log it - the profile was created successfully
        }

        return res.status(201).json(newProfile)
    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return res.status(500).json({ error: 'An unexpected error occurred' })
    }
} 