import supabase from './supabase'
import type { TablesInsert } from '@/types/supabase'

// Get or create end user when wallet connects
export async function getOrCreateEndUser(address: string) {
    console.log(`[getOrCreateEndUser] Processing for address: ${address}`)
    
    try {
        // First check if end user exists
        const { data: existingUser, error: fetchError } = await supabase()
            .from('agent_chain_end_users')
            .select('*')
            .eq('address', address)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(`[getOrCreateEndUser] Error fetching end user: ${fetchError.message}`)
            throw fetchError
        }

        if (existingUser) {
            console.log(`[getOrCreateEndUser] Found existing end user with address: ${address}`)
            return existingUser
        }

        // If not, create a new end user
        console.log(`[getOrCreateEndUser] Creating new end user with address: ${address}`)
        const userData: TablesInsert<'agent_chain_end_users'> = {
            address,
            agentCreated: false,
        }

        const { data, error } = await supabase()
            .from('agent_chain_end_users')
            .insert(userData)
            .select()
            .single()

        if (error) {
            console.error(`[getOrCreateEndUser] Error creating end user: ${error.message}`)
            throw error
        }

        console.log(`[getOrCreateEndUser] Successfully created end user with address: ${address}`)
        return data
    } catch (error) {
        console.error(`[getOrCreateEndUser] Unexpected error: ${error}`)
        throw error
    }
}

// Check if an end user has created an AI agent
export async function checkEndUserHasAgent(address: string) {
    console.log(`[checkEndUserHasAgent] Checking for address: ${address}`)
    
    try {
        // Get the end user record
        const { data: endUser, error: fetchError } = await supabase()
            .from('agent_chain_end_users')
            .select('agentCreated')
            .eq('address', address)
            .single()

        if (fetchError) {
            console.error(`[checkEndUserHasAgent] Error fetching end user: ${fetchError.message}`)
            return false
        }

        return endUser?.agentCreated || false
    } catch (error) {
        console.error(`[checkEndUserHasAgent] Unexpected error: ${error}`)
        return false
    }
}

// Get or create end user authentication
export async function getOrCreateEndUserAuth(address: string) {
    console.log(`[getOrCreateEndUserAuth] Processing auth for end user with address: ${address}`)
    
    try {
        // Ensure the end user exists in the database
        const endUser = await getOrCreateEndUser(address)
        console.log(`[getOrCreateEndUserAuth] End user record: ${JSON.stringify(endUser)}`)
        
        // Return the end user information
        return {
            address,
            id: endUser.id,
            agentCreated: endUser.agentCreated,
            // We don't create an AI agent profile automatically
            hasAgentProfile: false
        }
    } catch (error) {
        console.error(`[getOrCreateEndUserAuth] Error processing end user auth: ${error}`)
        throw error
    }
}
