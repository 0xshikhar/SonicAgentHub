import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import supabase from '@/lib/supabase'
import { getOrCreateUserProfile, createWalletForUser, getOrCreateEndUser } from '@/lib/user-utils'
import type { Database } from '@/types/supabase'
import { setCookie } from 'cookies-next'
import { showToast } from '@/lib/toast'
import { useWalletAuth } from '@/lib/hooks/useWalletAuth'
import LoadingState from '@/components/LoadingState'

type UserProfile = Database['public']['Tables']['agent_chain_users']['Row']

export default function DashboardPage() {
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const { isAuthenticated, isLoading, error } = useWalletAuth({ requireAuth: true })
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    useEffect(() => {
        // If wallet is not connected, redirect to home page (handled by useWalletAuth)
        if (!isConnected || !address || !isAuthenticated) {
            return
        }

        // Set wallet-connected cookie for middleware
        setCookie('wallet-connected', 'true', { maxAge: 60 * 60 * 24 }) // 24 hours

        // Fetch or create user profile
        const fetchUserProfile = async () => {
            setIsLoadingProfile(true)
            try {
                console.log(`[Dashboard] Fetching user profile for address: ${address}`)
                
                // First ensure the end user exists
                await getOrCreateEndUser(address)
                
                // Then get or create the user profile
                const profile = await getOrCreateUserProfile(address)
                console.log(`[Dashboard] User profile:`, profile)
                setUserProfile(profile)

                // Check if user has a wallet entry, if not create one
                const { data: walletData } = await supabase
                    .from('agent_chain_wallets')
                    .select('*')
                    .eq('handle', profile.handle)
                    .single()

                if (!walletData) {
                    console.log(`[Dashboard] Creating wallet for user: ${profile.handle}`)
                    // In a real app, you wouldn't store private keys like this
                    // This is just for demonstration
                    await createWalletForUser(profile.handle, address, 'demo-private-key')
                } else {
                    console.log(`[Dashboard] User already has a wallet: ${walletData.address}`)
                }
                
                showToast.success('Welcome to your dashboard!')
            } catch (error) {
                console.error('[Dashboard] Error fetching user profile:', error)
                showToast.error('Error loading your profile')
            } finally {
                setIsLoadingProfile(false)
            }
        }

        fetchUserProfile()
    }, [address, isConnected, router, isAuthenticated])

    // Fetch recent activity
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [isLoadingActivity, setIsLoadingActivity] = useState(false)

    useEffect(() => {
        if (!userProfile) return

        const fetchRecentActivity = async () => {
            setIsLoadingActivity(true)
            try {
                console.log(`[Dashboard] Fetching recent activity for user: ${userProfile.handle}`)
                const { data } = await supabase
                    .from('agent_chain_action_events')
                    .select('*')
                    .or(`from_handle.eq.${userProfile.handle},to_handle.eq.${userProfile.handle}`)
                    .order('created_at', { ascending: false })
                    .limit(5)

                setRecentActivity(data || [])
            } catch (error) {
                console.error('[Dashboard] Error fetching recent activity:', error)
            } finally {
                setIsLoadingActivity(false)
            }
        }

        fetchRecentActivity()
    }, [userProfile])

    if (isLoading || isLoadingProfile) {
        return <LoadingState />
    }

    if (error) {
        return (
            <div className="container py-12">
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="container py-12">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-yellow-700 mb-2">Profile Not Found</h2>
                    <p className="text-yellow-600">Error loading profile. Please try reconnecting your wallet.</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div>
                    <p className="text-sm text-muted-foreground">Connected: {address}</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="p-6 bg-card rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                    <div className="space-y-2">
                        <p><strong>Handle:</strong> {userProfile.handle}</p>
                        <p><strong>Display Name:</strong> {userProfile.display_name}</p>
                        <p><strong>Bio:</strong> {userProfile.bio || 'No bio yet'}</p>
                        <p><strong>Skills:</strong> {userProfile.skills || 'No skills added yet'}</p>
                        <p><strong>Life Goals:</strong> {userProfile.life_goals || 'No life goals added yet'}</p>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    {isLoadingActivity ? (
                        <p>Loading activity...</p>
                    ) : recentActivity.length > 0 ? (
                        <ul className="space-y-2">
                            {recentActivity.map((activity) => (
                                <li key={activity.id} className="p-2 border-b">
                                    <p><strong>{activity.action_type}</strong></p>
                                    <p className="text-sm text-muted-foreground">{activity.main_output}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    )
} 