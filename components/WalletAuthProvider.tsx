'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { setWalletConnected } from '../lib/auth'

interface WalletAuthProviderProps {
  children: React.ReactNode
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const { isConnected } = useAccount()

  useEffect(() => {
    // Update the wallet connection state in the cookie
    setWalletConnected(isConnected)
  }, [isConnected])

  return <>{children}</>
} 