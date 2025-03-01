import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Add detailed logging for debugging
console.log(`Supabase URL available: ${Boolean(supabaseUrl)}`)
console.log(`Supabase ANON key available: ${Boolean(supabaseKey)}`)
console.log(`Supabase SERVICE key available: ${Boolean(supabaseServiceKey)}`)

if (!supabaseUrl) {
    console.error('Missing Supabase URL in environment variables')
    throw new Error('Missing Supabase URL in environment variables')
}

if (!supabaseKey) {
    console.error('Missing Supabase ANON key in environment variables')
    throw new Error('Missing Supabase ANON key in environment variables')
}

// Create singleton instances to be reused throughout the codebase

// Standard client with anon key (subject to RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    db: { schema: 'public' },
    auth: { debug: true },
})

// Service role client that can bypass RLS if the key is available
export const serviceRoleClient = supabaseServiceKey
    ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null

// Default export for backward compatibility
export default supabase

// Cache for server component clients to avoid creating new instances
let serverComponentClientCache: any = null

// Helper function for server components
export const createServerSupabaseClient = async () => {
    try {
        // If we're in a server component and have a service role key, use it to bypass RLS
        if (serviceRoleClient) {
            return serviceRoleClient
        }

        // Use cached instance if available
        if (serverComponentClientCache) {
            return serverComponentClientCache
        }

        // Otherwise try to use the auth-helpers client
        const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
        const { cookies } = await import('next/headers')
        serverComponentClientCache = createServerComponentClient<Database>({ cookies })
        return serverComponentClientCache
    } catch (error) {
        console.error('Error creating server Supabase client:', error)
        // Fall back to direct client
        return supabase
    }
}

// Cache for server action clients to avoid creating new instances
let serverActionClientCache: any = null

// Helper function for server actions
export const createActionSupabaseClient = async () => {
    try {
        // If we're in a server action and have a service role key, use it to bypass RLS
        if (serviceRoleClient) {
            return serviceRoleClient
        }

        // Use cached instance if available
        if (serverActionClientCache) {
            return serverActionClientCache
        }

        // Otherwise try to use the auth-helpers client
        const { createServerActionClient } = await import('@supabase/auth-helpers-nextjs')
        const { cookies } = await import('next/headers')
        serverActionClientCache = createServerActionClient<Database>({ cookies })
        return serverActionClientCache
    } catch (error) {
        console.error('Error creating action Supabase client:', error)
        // Fall back to direct client
        return supabase
    }
}

// Helper function for API routes (Pages Router)
export const createApiSupabaseClient = () => {
    console.log('Creating API Supabase client with URL and key available')
    // For API routes, always use the service role client if available to bypass RLS
    if (serviceRoleClient) {
        console.log('Using service role client for API route')
        return serviceRoleClient
    }
    // Otherwise fall back to the anon key client
    return supabase
}