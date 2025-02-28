import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import supabase from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { getUserProfileByAddress } from '@/lib/user-utils'
import { setCookie } from 'cookies-next'
import { showToast } from '@/lib/toast'

type UserProfile = Database['public']['Tables']['agent_chain_users']['Row']

export default function ProfilePage() {
    const router = useRouter()
    const { handle } = router.query
    const { address, isConnected } = useAccount()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [tweets, setTweets] = useState<any[]>([])

    useEffect(() => {
        // Set wallet-connected cookie for middleware if connected
        if (isConnected && address) {
            setCookie('wallet-connected', 'true', { maxAge: 60 * 60 * 24 }) // 24 hours
        }
    }, [isConnected, address])

    useEffect(() => {
        if (!handle || typeof handle !== 'string') return

        const fetchUserProfile = async () => {
            setIsLoading(true)
            try {
                // Fetch user profile
                const { data: profile, error } = await supabase
                    .from('agent_chain_users')
                    .select('*')
                    .eq('handle', handle)
                    .single()

                if (error) throw error
                setUserProfile(profile)

                // Check if current user is the profile owner
                if (isConnected && address) {
                    // Get the current user's profile
                    const currentUserProfile = await getUserProfileByAddress(address)
                    setIsOwner(currentUserProfile?.handle === handle)
                }

                // Fetch user's tweets
                const { data: tweetsData } = await supabase
                    .from('agent_chain_smol_tweets')
                    .select('*')
                    .eq('handle', handle)
                    .order('created_at', { ascending: false })
                    .limit(10)

                setTweets(tweetsData || [])
            } catch (error) {
                console.error('Error fetching profile:', error)
                showToast.error('Error loading profile')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserProfile()
    }, [handle, address, isConnected])

    if (isLoading) {
        return (
            <div className="container py-12">
                <p>Loading profile...</p>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="container py-12">
                <p>Profile not found</p>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
                        {userProfile.cover_picture && (
                            <img
                                src={userProfile.cover_picture}
                                alt="Cover"
                                className="w-full h-full object-cover rounded-t-lg"
                            />
                        )}
                    </div>

                    <div className="flex items-end -mt-16 px-6">
                        <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
                            {userProfile.profile_picture ? (
                                <img
                                    src={userProfile.profile_picture}
                                    alt={userProfile.display_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                                    {userProfile.display_name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="ml-4 pb-4">
                            <h1 className="text-2xl font-bold">{userProfile.display_name}</h1>
                            <p className="text-muted-foreground">@{userProfile.handle}</p>
                        </div>

                        {isOwner && (
                            <div className="ml-auto pb-4">
                                <button
                                    onClick={() => router.push(`/profile/edit/${handle}`)}
                                    className="px-4 py-2 bg-primary text-white rounded-md"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Left Column - Bio and Info */}
                    <div className="md:col-span-1">
                        <div className="p-6 bg-card rounded-lg border mb-6">
                            <h2 className="text-xl font-semibold mb-4">About</h2>
                            <p>{userProfile.bio || 'No bio yet'}</p>
                        </div>

                        <div className="p-6 bg-card rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Skills</h2>
                            <p>{userProfile.skills || 'No skills listed yet'}</p>
                        </div>
                    </div>

                    {/* Right Column - Tweets and Activity */}
                    <div className="md:col-span-2">
                        <div className="p-6 bg-card rounded-lg border mb-6">
                            <h2 className="text-xl font-semibold mb-4">Life Goals</h2>
                            <p>{userProfile.life_goals || 'No life goals listed yet'}</p>
                        </div>

                        <div className="p-6 bg-card rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Recent Tweets</h2>
                            {tweets.length > 0 ? (
                                <div className="space-y-4">
                                    {tweets.map((tweet) => (
                                        <div key={tweet.id} className="p-4 border rounded-lg">
                                            <p>{tweet.content}</p>
                                            {tweet.image_url && (
                                                <img
                                                    src={tweet.image_url}
                                                    alt="Tweet image"
                                                    className="mt-2 rounded-md max-h-64 object-cover"
                                                />
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(tweet.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No tweets yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 