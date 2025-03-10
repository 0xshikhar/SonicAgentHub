import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Optional debugging (consider only enabling in development)
if (process.env.NODE_ENV === 'development') {
    console.log({
        supabaseUrlExists: Boolean(supabaseUrl),
        supabaseKeyExists: Boolean(supabaseKey),
        serviceKeyExists: Boolean(supabaseServiceKey),
    })
}

// Validation handling
if (!supabaseUrl || !supabaseKey) {
    // Handle missing credentials gracefully in production
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        console.error('Supabase credentials missing in production environment')
    }
}

// Standard client with public anon key (respects RLS)
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const supabase = () => {
    if (clientInstance) return clientInstance

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials')
    }

    clientInstance = createClient<Database>(supabaseUrl, supabaseKey, {
        db: { schema: 'public' },
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })

    return clientInstance
}

// Service role client (bypasses RLS)
let serviceRoleInstance: ReturnType<typeof createClient<Database>> | null = null

export const getServiceRoleClient = () => {
    if (serviceRoleInstance) return serviceRoleInstance

    if (!supabaseUrl || !supabaseServiceKey) {
        return null
    }

    serviceRoleInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    return serviceRoleInstance
}

// Server component client (with proper lazy loading)
export const createServerSupabaseClient = async () => {
    try {
        // Prioritize service role client for admin operations
        const serviceClient = getServiceRoleClient()
        if (serviceClient) return serviceClient

        // Check if we're in a context where cookies are available
        try {
            // Dynamic imports to avoid Next.js errors
            const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
            const { cookies } = await import('next/headers')
            
            // Try to access cookies to see if we're in a request context
            cookies()
            
            return createServerComponentClient<Database>({ cookies })
        } catch (cookieError) {
            // If cookies() fails, we're outside a request context
            console.log('Not in a request context, falling back to regular client')
            return supabase()
        }
    } catch (error) {
        console.error('Server component client error:', error)
        return supabase()
    }
}

// Server action client
export const createActionSupabaseClient = async () => {
    try {
        // Prioritize service role client for admin operations
        const serviceClient = getServiceRoleClient()
        if (serviceClient) return serviceClient

        // Check if we're in a context where cookies are available
        try {
            // Dynamic imports to avoid Next.js errors
            const { createServerActionClient } = await import('@supabase/auth-helpers-nextjs')
            const { cookies } = await import('next/headers')
            
            // Try to access cookies to see if we're in a request context
            cookies()
            
            return createServerActionClient<Database>({ cookies })
        } catch (cookieError) {
            // If cookies() fails, we're outside a request context
            console.log('Not in a request context, falling back to regular client')
            return supabase()
        }
    } catch (error) {
        console.error('Server action client error:', error)
        return supabase()
    }
}

// API routes client
export const createApiSupabaseClient = () => {
    return getServiceRoleClient() || supabase()
}

export default supabase
