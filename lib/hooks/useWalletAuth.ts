'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { useWalletAuthContext } from '@/components/WalletAuthProvider'
import { isWalletConnected, setWalletConnected } from '@/lib/auth'
import { showToast } from '@/lib/toast'

interface UseWalletAuthOptions {
    /**
     * If true, the hook will redirect to the home page if the wallet is not connected
     */
    requireAuth?: boolean
    /**
     * The path to redirect to if the wallet is not connected
     * @default '/'
     */
    redirectTo?: string
}

export function useWalletAuth(options: UseWalletAuthOptions = {}) {
    const { requireAuth = false, redirectTo = '/' } = options
    const { isConnected, address } = useAccount()
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { isProcessingUser, userStored, error, wallet } = useWalletAuthContext()
    const hasRedirected = useRef(false)
    const lastAuthCheck = useRef<number>(0)

    useEffect(() => {
        // Throttle auth checks to once every 2 seconds
        const now = Date.now()
        if (now - lastAuthCheck.current < 2000) {
            return
        }
        lastAuthCheck.current = now

        // Check if the wallet is connected
        const walletConnected = isWalletConnected() && isConnected && !!wallet?.address
        
        // Set the wallet-connected cookie if the wallet is connected
        if (isConnected && address) {
            setWalletConnected(true)
        }
        
        setIsAuthenticated(walletConnected)
        setIsLoading(isProcessingUser || false)

        // If authentication is required and the wallet is not connected, redirect to the home page
        // Only redirect once to prevent infinite redirects
        if (requireAuth && !walletConnected && !isLoading && !isProcessingUser && !hasRedirected.current) {
            console.log(`[useWalletAuth] Redirecting to ${redirectTo} because authentication is required but wallet is not connected`)
            hasRedirected.current = true
            router.push(redirectTo)
            showToast.error('Please connect your wallet to access this page')
        }
        
        // Reset redirect flag if wallet is connected
        if (walletConnected) {
            hasRedirected.current = false
        }
    }, [isConnected, requireAuth, redirectTo, router, isLoading, isProcessingUser, wallet, address])

    return {
        isAuthenticated,
        isLoading,
        wallet,
        error
    }
} 