import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from '@/lib/supabase'
import type { TablesInsert } from '@/types/supabase'

// Cache successful responses by address
const responseCache = new Map<string, { data: any; timestamp: number }>()

// Simple in-memory rate limiting with more generous limits
const rateLimit = {
    // Store timestamps of requests by IP
    requests: new Map<string, number[]>(),
    
    // Check if the IP has exceeded the rate limit
    check: (ip: string, limit: number = 10, windowMs: number = 60000): boolean => {
        const now = Date.now()
        const windowStart = now - windowMs
        
        // Get existing timestamps for this IP
        const timestamps = rateLimit.requests.get(ip) || []
        
        // Filter out timestamps outside the window
        const windowTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
        
        // Update the timestamps
        rateLimit.requests.set(ip, [...windowTimestamps, now])
        
        // Check if the number of requests in the window exceeds the limit
        return windowTimestamps.length < limit
    },
    
    // Clean up old entries
    cleanup: (): void => {
        const now = Date.now()
        const windowStart = now - 60000 // 1 minute window
        
        rateLimit.requests.forEach((timestamps, ip) => {
            const windowTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
            
            if (windowTimestamps.length === 0) {
                rateLimit.requests.delete(ip)
            } else {
                rateLimit.requests.set(ip, windowTimestamps)
            }
        })
        
        // Also clean up old cache entries (older than 5 minutes)
        const cacheWindowStart = now - 300000 // 5 minutes
        responseCache.forEach((entry, address) => {
            if (entry.timestamp < cacheWindowStart) {
                responseCache.delete(address)
            }
        })
    }
}

// Clean up old rate limit entries every minute
setInterval(rateLimit.cleanup, 60000)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { address } = req.body

        if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
            return res.status(400).json({ error: 'Invalid wallet address' })
        }
        
        // Check cache first
        const cachedResponse = responseCache.get(address)
        if (cachedResponse) {
            console.log(`[API] Returning cached response for address: ${address}`)
            return res.status(200).json(cachedResponse.data)
        }

        // Get client IP - use a default value to avoid undefined
        const clientIp = String(
            req.headers['x-forwarded-for'] || 
            req.socket.remoteAddress || 
            'unknown'
        )
        
        // Check rate limit
        if (!rateLimit.check(clientIp)) {
            console.log(`[API] Rate limit exceeded for IP: ${clientIp}`)
            return res.status(429).json({ error: 'Too many requests, please try again later' })
        }

        console.log(`[API] Attempting to get or create end user with address: ${address}`)

        // First check if end user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('agent_chain_end_users')
            .select('*')
            .eq('address', address)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is the error code for "no rows returned"
            console.error(`[API] Error fetching end user: ${fetchError.message}`, fetchError)
            return res.status(500).json({ error: `Error fetching end user: ${fetchError.message}` })
        }

        // If user exists, cache and return it
        if (existingUser) {
            console.log(`[API] Found existing end user with address: ${address}`)
            // Cache the response
            responseCache.set(address, { data: existingUser, timestamp: Date.now() })
            return res.status(200).json(existingUser)
        }

        console.log(`[API] Creating new end user with address: ${address}`)

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

        if (error) {
            console.error(`[API] Error creating end user: ${error.message}`, error)
            return res.status(500).json({ error: `Error creating end user: ${error.message}` })
        }

        console.log(`[API] Successfully created end user with address: ${address}`)
        // Cache the response
        responseCache.set(address, { data, timestamp: Date.now() })
        return res.status(201).json(data)
    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return res.status(500).json({ error: 'An unexpected error occurred' })
    }
} 