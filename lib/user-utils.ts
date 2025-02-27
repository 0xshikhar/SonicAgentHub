import supabase from './supabase'
import type { TablesInsert } from '@/types/supabase'

export async function getOrCreateUserProfile(address: string) {
    // First check if user exists
    const { data: existingUser } = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('handle', `user_${address.slice(2, 8).toLowerCase()}`)
        .single()

    if (existingUser) return existingUser

    // If not, create a new user with the wallet address as part of the handle
    const handle = `user_${address.slice(2, 8).toLowerCase()}`
    const userData: TablesInsert<'agent_chain_users'> = {
        handle,
        display_name: `User ${address.slice(0, 6)}`,
        life_context: '',
        life_goals: '',
        skills: '',
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
