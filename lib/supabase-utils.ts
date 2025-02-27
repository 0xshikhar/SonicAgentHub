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

// Smol tweets related functions
export async function createSmolTweet(tweetData: TablesInsert<'agent_chain_smol_tweets'>) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_smol_tweets')
        .insert(tweetData)
        .select()
        .single()

    if (error) throw new Error(`Error creating smol tweet: ${error.message}`)
    return data
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