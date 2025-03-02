'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useAccount } from 'wagmi'
import { setWalletConnected } from '../lib/auth'
import { getOrCreateEndUser } from '../lib/supabase-utils'
import { storeWalletConnectionClient } from '../lib/client/user-actions'

// Create a context to share the user storage state
interface WalletAuthContextType {
  isProcessingUser: boolean
  userStored: boolean
  error: string | null
  wallet: { address: string } | null
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
  const { isConnected, address } = useAccount()
  const [isProcessing, setIsProcessing] = useState(false)
  const [userStored, setUserStored] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<{ address: string } | null>(null)

  useEffect(() => {
    // Update the wallet connection state in the cookie
    setWalletConnected(isConnected)
    
    // Reset state when wallet is disconnected
    if (!isConnected) {
      setUserStored(false)
      setError(null)
      setWallet(null)
      console.log('[WalletAuthProvider] Wallet disconnected, resetting state')
      return
    }
    
    // If wallet is connected and we have an address, store the user in the database
    if (isConnected && address && !isProcessing && !userStored) {
      const storeUser = async () => {
        setIsProcessing(true)
        console.log(`[WalletAuthProvider] Wallet connected with address: ${address}. Attempting to store in database...`)
        
        try {
          // Try API endpoint first
          try {
            console.log('[WalletAuthProvider] Attempting API call first...')
            const result = await storeWalletConnectionClient({ address })
            
            if (result.error) {
              console.error('[WalletAuthProvider] API call failed:', result.error)
              throw new Error(result.error)
            } else {
              console.log('[WalletAuthProvider] Successfully stored user via API call:', result.data)
              setUserStored(true)
              setError(null)
              setWallet({ address })
              setIsProcessing(false)
              return
            }
          } catch (apiErr) {
            console.error('[WalletAuthProvider] API call failed:', apiErr)
            // If API call fails, try direct database call as fallback
          }
          
          // Fallback to direct database call
          console.log('[WalletAuthProvider] Attempting direct database call as fallback...')
          const user = await getOrCreateEndUser(address)
          console.log('[WalletAuthProvider] Successfully stored user via direct call:', user)
          setUserStored(true)
          setError(null)
          setWallet({ address })
        } catch (err) {
          console.error('[WalletAuthProvider] Failed to store user in database:', err)
          setError(err instanceof Error ? err.message : 'Unknown error storing user')
          setUserStored(false)
          setWallet(null)
        } finally {
          setIsProcessing(false)
        }
      }
      
      storeUser()
    } else if (isConnected && address && userStored) {
      // If wallet is already connected and user is stored, update wallet state
      setWallet({ address })
      console.log(`[WalletAuthProvider] Wallet already connected with address: ${address}`)
    }
  }, [isConnected, address, isProcessing, userStored])

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