'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { isWalletConnected, setWalletConnected } from '../auth'
import { useWalletAuthContext } from '@/components/WalletAuthProvider'

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

    useEffect(() => {
        // Check if the wallet is connected
        const walletConnected = isWalletConnected() && isConnected && !!wallet
        console.log(`[useWalletAuth] Wallet connected: ${walletConnected}, isConnected: ${isConnected}, wallet: ${JSON.stringify(wallet)}`)
        
        setIsAuthenticated(walletConnected)
        setIsLoading(isProcessingUser || false)

        // If authentication is required and the wallet is not connected, redirect to the home page
        if (requireAuth && !walletConnected && !isLoading && !isProcessingUser) {
            console.log(`[useWalletAuth] Redirecting to ${redirectTo} because authentication is required but wallet is not connected`)
            router.push(redirectTo)
        }
    }, [isConnected, requireAuth, redirectTo, router, isLoading, isProcessingUser, wallet])

    return {
        isAuthenticated,
        isLoading: isLoading || isProcessingUser,
        isProcessing: isProcessingUser,
        wallet,
        error
    }
} 