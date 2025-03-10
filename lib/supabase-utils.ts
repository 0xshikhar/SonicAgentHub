import { createServerSupabaseClient, createActionSupabaseClient } from './supabase'
import type { Database } from '@/types/supabase'
import type {
    Tables,
    TablesInsert
} from '@/types/supabase'

// User related functions
export async function getUser(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('handle', handle)
        .single()

    if (error) throw new Error(`Error fetching user: ${error.message}`)
    return data
}

export async function createUser(userData: TablesInsert<'agent_chain_users'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .insert(userData)
        .select()
        .single()

    if (error) throw new Error(`Error creating user: ${error.message}`)
    return data
}

export async function updateUser(handle: string, updates: Partial<TablesInsert<'agent_chain_users'>>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .update(updates)
        .eq('handle', handle)
        .select()
        .single()

    if (error) throw new Error(`Error updating user: ${error.message}`)
    return data
}

// Action events related functions
export async function createActionEvent(eventData: TablesInsert<'agent_chain_action_events'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_action_events')
        .insert(eventData)
        .select()
        .single()

    if (error) throw new Error(`Error creating action event: ${error.message}`)
    return data
}

export async function getActionEvents(fromHandle?: string, toHandle?: string, limit = 10) {
    const supabase = await createServerSupabaseClient()
    let query = supabase
        .from('agent_chain_action_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (fromHandle) query = query.eq('from_handle', fromHandle)
    if (toHandle) query = query.eq('to_handle', toHandle)

    const { data, error } = await query

    if (error) throw new Error(`Error fetching action events: ${error.message}`)
    return data
}

// // Smol tweets related functions
// export async function createSmolTweet(tweetData: TablesInsert<'agent_chain_smol_tweets'>) {
//     const supabase = await createActionSupabaseClient()
//     const { data, error } = await supabase
//         .from('agent_chain_smol_tweets')
//         .insert(tweetData)
//         .select()
//         .single()

//     if (error) throw new Error(`Error creating smol tweet: ${error.message}`)
//     return data
// }
export async function createSmolTweet(
    handle: string,
    content: string,
    actionId?: string | null, // Make sure actionId is optional
    actionType: string = "TWEET", // Default action type
    imageUrl?: string,
    link?: string,
    linkTitle?: string,
    linkPreviewImgUrl?: string
) {
    const supabase = await createActionSupabaseClient()
    try {
        // First, verify that if actionId is provided, it exists in action_events
        if (actionId) {
            const { data: actionExists } = await supabase
                .from('agent_chain_action_events')
                .select('id')
                .eq('id', actionId)
                .single();

            if (!actionExists) {
                console.log(`Action ID ${actionId} does not exist, creating tweet without action reference`);
                actionId = null; // Set to null if not found 
            }
        }

        // Now create the tweet with null actionId if it wasn't valid
        const { data, error } = await supabase
            .from('agent_chain_smol_tweets')
            .insert({
                handle,
                content,
                action_id: actionId || null, // Use null if actionId is falsy
                action_type: actionType,
                image_url: imageUrl || null,
                link: link || null,
                link_title: linkTitle || null,
                link_preview_img_url: linkPreviewImgUrl || null,
            })
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error creating smol tweet:", error);
        throw new Error(`Error creating smol tweet: ${error}`);
    }
}

export async function getSmolTweets(handle?: string, limit = 20) {
    const supabase = await createServerSupabaseClient()
    let query = supabase
        .from('agent_chain_smol_tweets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (handle) query = query.eq('handle', handle)

    const { data, error } = await query

    if (error) throw new Error(`Error fetching smol tweets: ${error.message}`)
    return data
}

// Life context updates related functions
export async function createLifeContextUpdate(updateData: TablesInsert<'agent_chain_updates_life_context'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_life_context')
        .insert(updateData)
        .select()
        .single()

    if (error) throw new Error(`Error creating life context update: ${error.message}`)
    return data
}

// Skills updates related functions
export async function createSkillsUpdate(updateData: TablesInsert<'agent_chain_updates_skills'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_skills')
        .insert(updateData)
        .select()
        .single()

    if (error) throw new Error(`Error creating skills update: ${error.message}`)
    return data
}

// Life goals updates related functions
export async function createLifeGoalsUpdate(updateData: TablesInsert<'agent_chain_updates_life_goals'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_life_goals')
        .insert(updateData)
        .select()
        .single()

    if (error) throw new Error(`Error creating life goals update: ${error.message}`)
    return data
}

// Wallet related functions
export async function getWallet(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_wallets')
        .select('*')
        .eq('handle', handle)
        .single()

    if (error) throw new Error(`Error fetching wallet: ${error.message}`)
    return data
}

export async function createWallet(walletData: TablesInsert<'agent_chain_wallets'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_wallets')
        .insert(walletData)
        .select()
        .single()

    if (error) throw new Error(`Error creating wallet: ${error.message}`)
    return data
}

// End user related functions
export async function getOrCreateEndUser(address: string) {
    // Use the appropriate client based on environment
    const supabaseClient = typeof window === 'undefined'
        ? await createServerSupabaseClient()
        : await createActionSupabaseClient()

    console.log(`Attempting to get or create end user with address: ${address}`)

    // First check if end user exists
    const { data: existingUser, error: fetchError } = await supabaseClient
        .from('agent_chain_end_users')
        .select('*')
        .eq('address', address)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        console.error(`Error fetching end user: ${fetchError.message}`, fetchError)
        throw new Error(`Error fetching end user: ${fetchError.message}`)
    }

    // If user exists, return it
    if (existingUser) {
        console.log(`Found existing end user with address: ${address}`, existingUser)
        return existingUser
    }

    console.log(`Creating new end user with address: ${address}`)

    // If not, create a new end user
    const userData: TablesInsert<'agent_chain_end_users'> = {
        address,
        agentCreated: false,
    }

    const { data, error } = await supabaseClient
        .from('agent_chain_end_users')
        .insert(userData)
        .select()
        .single()

    if (error) {
        console.error(`Error creating end user: ${error.message}`, error)
        throw new Error(`Error creating end user: ${error.message}`)
    }

    console.log(`Successfully created end user with address: ${address}`, data)
    return data
}

// General agents related functions
export async function getGeneralAgent(id: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_general_agents')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw new Error(`Error fetching general agent: ${error.message}`)
    return data
}

export async function getGeneralAgentByHandle(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_general_agents')
        .select('*')
        .eq('handle', handle)
        .single()

    if (error) throw new Error(`Error fetching general agent by handle: ${error.message}`)
    return data
}

export async function listGeneralAgents(limit = 20, agentType?: 'twitter' | 'character') {
    const supabase = await createServerSupabaseClient()
    let query = supabase
        .from('agent_chain_general_agents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (agentType) query = query.eq('agent_type', agentType)

    const { data, error } = await query

    if (error) throw new Error(`Error fetching general agents: ${error.message}`)
    return data
}

export async function createGeneralAgent(agentData: TablesInsert<'agent_chain_general_agents'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_general_agents')
        .insert(agentData)
        .select()
        .single()

    if (error) throw new Error(`Error creating general agent: ${error.message}`)
    return data
}

export async function updateGeneralAgent(id: string, updates: Partial<TablesInsert<'agent_chain_general_agents'>>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_general_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(`Error updating general agent: ${error.message}`)
    return data
}

export async function deleteGeneralAgent(id: string) {
    const supabase = await createActionSupabaseClient()
    const { error } = await supabase
        .from('agent_chain_general_agents')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`Error deleting general agent: ${error.message}`)
    return true
} 