'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWalletAuth } from './hooks/useWalletAuth'
import LoadingState from '../components/LoadingState'

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
    const { isAuthenticated, isLoading } = useWalletAuth({
      requireAuth: true,
      redirectTo
    })

    if (isLoading) {
      return <LoadingState />
    }

    if (!isAuthenticated) {
      return null // Will redirect in the useWalletAuth hook
    }

    return <Component {...props} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component'
  WithWalletAuthComponent.displayName = `withWalletAuth(${displayName})`

  return WithWalletAuthComponent
} 