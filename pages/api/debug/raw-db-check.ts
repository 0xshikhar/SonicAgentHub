import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        console.log('Creating Supabase client for raw DB check')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )

        console.log('Supabase client created', process.env.NEXT_PUBLIC_SUPABASE_URL)

        // Get the handle from query params
        const { handle } = req.query
        const targetHandle = typeof handle === 'string' ? handle : 'ilblackdragon'

        console.log(`Performing raw DB check for handle: ${targetHandle}`)

        // Get all tables info
        let tablesList = null
        let tablesError = null
        try {
            const tablesResult = await supabase
                .from('_tables')
                .select('*')
                .limit(20)
            tablesList = tablesResult.data
            tablesError = tablesResult.error
        } catch (err: any) {
            tablesError = { message: 'Could not fetch tables list: ' + (err.message || 'Unknown error') }
            console.error('Error fetching tables list:', err)
        }

        // Get all users from agent_chain_users
        const { data: agent_chain_users, error } = await supabase
            .from('agent_chain_users')
            .select('*')
            .limit(20)

        console.log('All users agents fetched', agent_chain_users)
        console.log('Error fetching all users', error)

        // Test different query methods for the target handle
        const queryResults = []

        const { data: data2, error: error2 } = await supabase
            .from('agent_chain_users')
            .select('*')    
            .eq('handle', "ilblackdragon")

        console.log('Target handle', targetHandle, 'Data', data2, 'Error', error2)    

        // Test 1: Exact match with eq
        const { data: eqResult, error: eqError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', targetHandle)

        queryResults.push({
            method: 'eq',
            success: !eqError,
            count: eqResult?.length || 0,
            error: eqError ? eqError.message : null
        })

        // Test 2: Case-insensitive match with ilike
        const { data: ilikeResult, error: ilikeError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .ilike('handle', targetHandle)

        queryResults.push({
            method: 'ilike',
            success: !ilikeError,
            count: ilikeResult?.length || 0,
            error: ilikeError ? ilikeError.message : null
        })

        // Test 3: Like with wildcards
        const { data: likeWildcardResult, error: likeWildcardError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .like('handle', `%${targetHandle}%`)

        queryResults.push({
            method: 'like with wildcards',
            success: !likeWildcardError,
            count: likeWildcardResult?.length || 0,
            error: likeWildcardError ? likeWildcardError.message : null
        })

        // Test 4: Match with textSearch
        let textSearchResult = null
        let textSearchError = null
        try {
            const textSearchResponse = await supabase
                .from('agent_chain_users')
                .select('*')
                .textSearch('handle', targetHandle)
            textSearchResult = textSearchResponse.data
            textSearchError = textSearchResponse.error
        } catch (err: any) {
            textSearchError = { message: 'textSearch not supported or error: ' + (err.message || 'Unknown error') }
        }

        queryResults.push({
            method: 'textSearch',
            success: !textSearchError,
            count: textSearchResult?.length || 0,
            error: textSearchError ? textSearchError.message : null
        })

        // Test 5: Raw query with contains
        let containsResult = null
        let containsError = null
        try {
            const containsResponse = await supabase
                .from('agent_chain_users')
                .select('*')
                .contains('handle', [targetHandle])
            containsResult = containsResponse.data
            containsError = containsResponse.error
        } catch (err: any) {
            containsError = { message: 'contains not applicable for string column: ' + (err.message || 'Unknown error') }
        }

        queryResults.push({
            method: 'contains',
            success: !containsError,
            count: containsResult?.length || 0,
            error: containsError ? containsError.message : null
        })

        // Check column names and types
        let columnInfo = null
        let columnError = null
        try {
            const columnResponse = await supabase
                .rpc('get_column_info', { table_name: 'agent_chain_users' })
            columnInfo = columnResponse.data
            columnError = columnResponse.error
        } catch (err: any) {
            columnError = { message: 'RPC not available or error: ' + (err.message || 'Unknown error') }
        }

        // Return all the collected data
        return res.status(200).json({
            success: true,
            tables: tablesList || [],
            tablesError: tablesError ? tablesError.message : null,
            allUsers: agent_chain_users || [],
            usersError: error ? error.message : null,
            targetHandle,
            queryResults,
            columnInfo: columnInfo || [],
            columnError: columnError ? columnError.message : null,
            // Include raw data for the first matching result
            matchingUser: eqResult?.[0] || ilikeResult?.[0] || likeWildcardResult?.[0] || null
        })
    } catch (error: any) {
        console.error('Error in raw-db-check API:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'An unknown error occurred'
        })
    }
} 