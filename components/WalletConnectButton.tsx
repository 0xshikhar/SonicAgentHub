'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWalletAuthContext } from './WalletAuthProvider'

export function WalletConnectButton() {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const { isProcessingUser, userStored, error } = useWalletAuthContext()

    // Show toast when user is stored or error occurs
    useEffect(() => {
        if (isConnected && userStored) {
            toast.success('Wallet connected successfully')
        }
        
        if (error) {
            toast.error(`Connection error: ${error}`)
        }
    }, [isConnected, userStored, error])

    if (isConnected) {
        return (
            <Button
                onClick={() => {
                    console.log('Disconnecting wallet...')
                    disconnect()
                }}
                variant="outline"
            >
                {isProcessingUser ? 'Storing...' : 'Disconnect'}
            </Button>
        )
    }

    return (
        <div>
            {connectors.map((connector) => (
                <Button
                    key={connector.id}
                    onClick={() => {
                        console.log(`Connecting with connector: ${connector.id}...`)
                        connect({ connector })
                    }}
                    disabled={!connector.ready}
                    variant="default"
                >
                    Connect Wallet
                </Button>
            ))}
        </div>
    )
} 