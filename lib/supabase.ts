import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl) {
    throw new Error('Missing Supabase URL in environment variables')
}

if (!supabaseKey) {
    throw new Error('Missing Supabase ANON key in environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default supabase;

// Helper function for server components
export const createServerSupabaseClient = async () => {
    const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
    const { cookies } = await import('next/headers')
    return createServerComponentClient<Database>({ cookies })
}

// Helper function for server actions
export const createActionSupabaseClient = async () => {
    const { createServerActionClient } = await import('@supabase/auth-helpers-nextjs')
    const { cookies } = await import('next/headers')
    return createServerActionClient<Database>({ cookies })
}