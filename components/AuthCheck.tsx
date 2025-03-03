'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { showToast } from '@/lib/toast'

interface AuthCheckProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * A simple component that checks if the wallet is connected
 * and shows an error toast if not
 */
export function AuthCheck({ children, redirectTo = '/' }: AuthCheckProps) {
    const { isConnected } = useAccount()
    const router = useRouter()
    const [hasShownError, setHasShownError] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => {
        // Only show error and redirect once to prevent multiple toasts and redirects
        if (!isConnected && !hasShownError && !isRedirecting) {
            setHasShownError(true)
            showToast.error('Please connect your wallet to access this page')

            // Optional: redirect to home page
            if (redirectTo && router.pathname !== redirectTo) {
                setIsRedirecting(true)
                router.push(redirectTo)
            }
        }
        
        // Reset error state when wallet is connected
        if (isConnected && hasShownError) {
            setHasShownError(false)
            setIsRedirecting(false)
        }
    }, [isConnected, hasShownError, redirectTo, router, isRedirecting])

    // If wallet is connected, render children
    // Otherwise, still render children but with error toast
    // This allows the UI to be visible while connecting wallet
    return <>{children}</>
} 