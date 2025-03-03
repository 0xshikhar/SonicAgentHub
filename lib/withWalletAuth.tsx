'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWalletAuth } from './hooks/useWalletAuth'
import LoadingState from '../components/LoadingState'
import { showToast } from '@/lib/toast'

interface WithWalletAuthOptions {
  /**
   * The path to redirect to if the wallet is not connected
   * @default '/'
   */
  redirectTo?: string
}

/**
 * Higher-order component that protects routes that require wallet authentication
 * If the wallet is not connected, the user will be redirected to the specified path
 */
export function withWalletAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithWalletAuthOptions = {}
) {
  const { redirectTo = '/' } = options

  function WithWalletAuthComponent(props: P) {
    const { isAuthenticated, isLoading, error, wallet } = useWalletAuth({ 
      requireAuth: true,
      redirectTo
    })
    
    const router = useRouter()

    useEffect(() => {
      if (error) {
        showToast.error(`Authentication error: ${error}`)
      }
    }, [error])

    if (isLoading) {
      return <LoadingState />
    }

    if (!isAuthenticated) {
      // Show a message before redirecting
      showToast.error('Please connect your wallet to access this page')
      
      // Will redirect in the useWalletAuth hook
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-center mb-6">Please connect your wallet to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      )
    }

    // Pass the wallet to the component
    return <Component {...props} wallet={wallet} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component'
  WithWalletAuthComponent.displayName = `withWalletAuth(${displayName})`

  return WithWalletAuthComponent
} 