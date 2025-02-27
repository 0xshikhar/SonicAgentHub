import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import supabase from '@/lib/supabase'
import { getOrCreateUserProfile, createWalletForUser } from '@/lib/user-utils'
import type { Database } from '@/types/supabase'
import { setCookie } from 'cookies-next'

type UserProfile = Database['public']['Tables']['agent_chain_users']['Row']

export default function DashboardPage() {
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // If wallet is not connected, redirect to home page
        if (!isConnected || !address) {
            router.push('/')
            return
        }

        // Set wallet-connected cookie for middleware
        setCookie('wallet-connected', 'true', { maxAge: 60 * 60 * 24 }) // 24 hours

        // Fetch or create user profile
        const fetchUserProfile = async () => {
            setIsLoading(true)
            try {
                const profile = await getOrCreateUserProfile(address)
                setUserProfile(profile)

                // Check if user has a wallet entry, if not create one
                const { data: walletData } = await supabase
                    .from('agent_chain_wallets')
                    .select('*')
                    .eq('handle', profile.handle)
                    .single()

                if (!walletData) {
                    // In a real app, you wouldn't store private keys like this
                    // This is just for demonstration
                    await createWalletForUser(profile.handle, address, 'demo-private-key')
                }
            } catch (error) {
                console.error('Error fetching user profile:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserProfile()
    }, [address, isConnected, router])

    // Fetch recent activity
    const [recentActivity, setRecentActivity] = useState<any[]>([])

    useEffect(() => {
        if (!userProfile) return

        const fetchRecentActivity = async () => {
            try {
                const { data } = await supabase
                    .from('agent_chain_action_events')
                    .select('*')
                    .or(`from_handle.eq.${userProfile.handle},to_handle.eq.${userProfile.handle}`)
                    .order('created_at', { ascending: false })
                    .limit(5)

                setRecentActivity(data || [])
            } catch (error) {
                console.error('Error fetching recent activity:', error)
            }
        }

        fetchRecentActivity()
    }, [userProfile])

    if (isLoading) {
        return (
            <div className="container py-12">
                <p>Loading dashboard...</p>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="container py-12">
                <p>Error loading profile. Please try reconnecting your wallet.</p>
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
                    {recentActivity.length > 0 ? (
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