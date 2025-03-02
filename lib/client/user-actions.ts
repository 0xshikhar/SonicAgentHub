// Client-side function to store wallet connection
import axios from 'axios'
import type { ActionResponse } from '@/types/actions'

// Simple cache to prevent duplicate API calls
const processedAddresses: Record<string, Promise<ActionResponse<{ success: boolean; user: any }>>> = {}

// Function to store a user in the database when they connect their wallet
export async function storeWalletConnectionClient({ address }: { address: string }): Promise<ActionResponse<{ success: boolean; user: any }>> {
    // If we're already processing this address, return the existing promise
    if (processedAddresses[address]) {
        console.log(`[Client Action] Address ${address} is already being processed, reusing existing request`)
        return processedAddresses[address]
    }
    
    console.log(`[Client Action] Attempting to store wallet connection for address: ${address}`)
    
    // Create the promise and store it in the cache
    const promise = (async () => {
        try {
            // Get the base URL with window check
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            console.log(`[Client Action] Using API endpoint: ${baseUrl}/api/users/wallet-connection`);
            
            // Call the API endpoint
            const response = await axios.post(`${baseUrl}/api/users/wallet-connection`, { address })
            console.log(`[Client Action] Successfully stored user:`, response.data)
            
            return {
                data: { 
                    success: true,
                    user: response.data
                },
                error: null,
            }
        } catch (error) {
            console.error('[Client Action] Failed to store wallet connection:', error)
            
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error storing wallet connection',
            }
        } finally {
            // Remove from cache after a short delay to prevent race conditions
            setTimeout(() => {
                delete processedAddresses[address]
            }, 5000)
        }
    })()
    
    // Store the promise in the cache
    processedAddresses[address] = promise
    
    return promise
} 