'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useAccount } from 'wagmi'
import { getOrCreateEndUser } from '../lib/supabase-utils'
import { checkEndUserHasAgent } from '@/lib/user-utils'

// Create a context to share the user storage state
interface WalletAuthContextType {
  isProcessingUser: boolean
  userStored: boolean
  error: string | null
  wallet: { 
    address: string; 
    hasAgent: boolean;
    agentHandle?: string;
  } | null
}

const WalletAuthContext = createContext<WalletAuthContextType>({
  isProcessingUser: false,
  userStored: false,
  error: null,
  wallet: null
})

// Hook to access the wallet auth context
export function useWalletAuthContext() {
  return useContext(WalletAuthContext)
}

interface WalletAuthProviderProps {
  children: React.ReactNode
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userStored, setUserStored] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<WalletAuthContextType['wallet']>(null)
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string | null>(null)
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<number>(0)

  const { address, isConnected } = useAccount()

  // Store user in database when wallet is connected
  useEffect(() => {
    // Skip if already processing, no address, or not connected
    if (isProcessing || !address || !isConnected) return

    // Skip if we've already checked this address recently (within 30 seconds)
    const now = Date.now()
    if (address === lastCheckedAddress && (now - lastCheckTimestamp) < 30000) {
      console.log(`[WalletAuthProvider] Skipping check for ${address}, last checked ${(now - lastCheckTimestamp) / 1000}s ago`)
      return
    }

    // Skip if we've already stored the user
    if (userStored) return

    // Update last checked timestamp and address
    setLastCheckedAddress(address)
    setLastCheckTimestamp(now)
    
    storeUser()
  }, [address, isConnected, userStored])

  const storeUser = async () => {
    if (!address || !isConnected) return
    
    setIsProcessing(true)
    console.log(`[WalletAuthProvider] Processing end user with address: ${address}`)
    
    try {
      // First, ensure the end user exists in the database
      await getOrCreateEndUser(address)
      
      // Check if this end user has created an AI agent
      const hasAgent = await checkEndUserHasAgent(address)
      
      // Set the wallet info
      setWallet({ 
        address, 
        hasAgent,
      })
      
      setUserStored(true)
      setError(null)
    } catch (err) {
      console.error('[WalletAuthProvider] Error storing user:', err)
      setError(err instanceof Error ? err.message : 'Unknown error storing user')
      // Still set the wallet so the user can continue
      setWallet({ address, hasAgent: false })
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset state when wallet is disconnected
  useEffect(() => {
    if (!isConnected) {
      setUserStored(false)
      setWallet(null)
      setError(null)
    }
  }, [isConnected])

  // Provide the context value
  const contextValue: WalletAuthContextType = {
    isProcessingUser: isProcessing,
    userStored,
    error,
    wallet
  }

  return (
    <WalletAuthContext.Provider value={contextValue}>
      {children}
    </WalletAuthContext.Provider>
  )
} 