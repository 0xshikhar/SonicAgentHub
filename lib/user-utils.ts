import supabase from './supabase'
import type { TablesInsert } from '@/types/supabase'

export async function getOrCreateEndUser(address: string) {
    // First check if end user exists
    const { data: existingUser } = await supabase
        .from('agent_chain_end_users')
        .select('*')
        .eq('address', address)
        .single()

    if (existingUser) return existingUser

    // If not, create a new end user
    const userData: TablesInsert<'agent_chain_end_users'> = {
        address,
        agentCreated: false,
    }

    const { data, error } = await supabase
        .from('agent_chain_end_users')
        .insert(userData)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getOrCreateUserProfile(address: string) {
    // First ensure the end user exists
    await getOrCreateEndUser(address)

    // Then check if user profile exists
    const { data: existingUser } = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('handle', `user_${address.slice(2, 8).toLowerCase()}`)
        .single()

    if (existingUser) return existingUser

    // If not, create a new user profile with the wallet address as part of the handle
    const handle = `user_${address.slice(2, 8).toLowerCase()}`
    const userData: TablesInsert<'agent_chain_users'> = {
        handle,
        display_name: `User ${address.slice(0, 6)}`,
        life_context: '',
        life_goals: '',
        skills: '',
        creator: address, // Link to the end user
    }

    const { data, error } = await supabase
        .from('agent_chain_users')
        .insert(userData)
        .select()
        .single()

    if (error) throw error
    return data
}

// Create a wallet entry for the user
export async function createWalletForUser(handle: string, address: string, privateKey: string) {
    const { data, error } = await supabase
        .from('agent_chain_wallets')
        .insert({
            handle,
            address,
            private_key: privateKey,
            permit_signature: '' // This would be populated when needed
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// Get user profile by wallet address
export async function getUserProfileByAddress(address: string) {
    // First try to find the user's wallet
    const { data: walletData } = await supabase
        .from('agent_chain_wallets')
        .select('handle')
        .eq('address', address)
        .single()

    if (walletData?.handle) {
        // If found, get the user profile
        const { data: userData } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', walletData.handle)
            .single()

        return userData
    }

    // If not found by wallet, try to find by creator field
    const { data: userData } = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('creator', address)
        .single()

    return userData
}
