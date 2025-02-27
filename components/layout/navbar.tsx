'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import supabase from '@/lib/supabase'
import { deleteCookie } from 'cookies-next'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [userHandle, setUserHandle] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      // Fetch user handle from wallet address
      const fetchUserHandle = async () => {
        try {
          const { data } = await supabase
            .from('agent_chain_wallets')
            .select('handle')
            .eq('address', address)
            .single()
          
          if (data?.handle) {
            setUserHandle(data.handle)
          }
        } catch (error) {
          console.error('Error fetching user handle:', error)
        }
      }

      fetchUserHandle()
    } else {
      setUserHandle(null)
    }
  }, [address, isConnected])

  const handleConnect = () => {
    // Connect using the first available connector (usually injected - metamask)
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    deleteCookie('wallet-connected')
    router.push('/')
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Agent Market
            </Link>
            
            {isConnected && (
              <div className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-md ${
                    router.pathname === '/dashboard' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/tweets" 
                  className={`px-3 py-2 rounded-md ${
                    router.pathname === '/tweets' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Tweets
                </Link>
                {userHandle && (
                  <Link 
                    href={`/profile/${userHandle}`}
                    className={`px-3 py-2 rounded-md ${
                      router.pathname.startsWith('/profile') 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Profile
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div>
            {isConnected ? (
              <div className="flex items-center">
                <span className="mr-4 text-sm text-muted-foreground hidden md:block">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 