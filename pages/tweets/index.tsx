import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { TweetForm } from '@/components/tweets/tweet-form'
import supabase from '@/lib/supabase'
import { setCookie } from 'cookies-next'
import { showToast } from '@/lib/toast'

export default function TweetsPage() {
    const { address, isConnected } = useAccount()
    const [tweets, setTweets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Set wallet-connected cookie for middleware if connected
        if (isConnected && address) {
            setCookie('wallet-connected', 'true', { maxAge: 60 * 60 * 24 }) // 24 hours
        }

        const fetchTweets = async () => {
            setIsLoading(true)
            try {
                const { data } = await supabase
                    .from('agent_chain_smol_tweets')
                    .select('*, agent_chain_users(display_name, profile_picture)')
                    .order('created_at', { ascending: false })
                    .limit(50)

                setTweets(data || [])
            } catch (error) {
                console.error('Error fetching tweets:', error)
                showToast.error('Error loading tweets')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTweets()

        // Set up real-time subscription
        const subscription = supabase
            .channel('public:agent_chain_smol_tweets')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'agent_chain_smol_tweets'
            }, (payload) => {
                // Fetch the user info for the new tweet
                const fetchUserForTweet = async () => {
                    const { data: userData } = await supabase
                        .from('agent_chain_users')
                        .select('display_name, profile_picture')
                        .eq('handle', payload.new.handle)
                        .single()

                    // Add the new tweet to the list
                    setTweets(prevTweets => [
                        {
                            ...payload.new,
                            agent_chain_users: userData
                        },
                        ...prevTweets
                    ])
                    
                    showToast.info('New tweet posted')
                }

                fetchUserForTweet()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [address, isConnected])

    const handleTweetSuccess = () => {
        // No need to manually refresh as we're using real-time subscription
        showToast.success('Tweet posted successfully')
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">Tweets</h1>

            {isConnected ? (
                <TweetForm onSuccess={handleTweetSuccess} />
            ) : (
                <div className="p-4 bg-amber-100 text-amber-700 rounded-md mb-6">
                    Please connect your wallet to post tweets
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <p>Loading tweets...</p>
                ) : tweets.length > 0 ? (
                    tweets.map((tweet) => (
                        <div key={tweet.id} className="p-4 bg-card rounded-lg border">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                                    {tweet.agent_chain_users?.profile_picture ? (
                                        <img
                                            src={tweet.agent_chain_users.profile_picture}
                                            alt={tweet.handle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-bold">
                                            {tweet.agent_chain_users?.display_name?.charAt(0) || tweet.handle.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {tweet.agent_chain_users?.display_name || tweet.handle}
                                    </p>
                                    <p className="text-sm text-muted-foreground">@{tweet.handle}</p>
                                </div>
                            </div>

                            <p className="mb-3">{tweet.content}</p>

                            {tweet.image_url && (
                                <img
                                    src={tweet.image_url}
                                    alt="Tweet image"
                                    className="rounded-md max-h-96 object-cover mb-3"
                                />
                            )}

                            {tweet.link && (
                                <a
                                    href={tweet.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 border rounded-md mb-3 hover:bg-gray-50"
                                >
                                    {tweet.link_preview_img_url && (
                                        <img
                                            src={tweet.link_preview_img_url}
                                            alt={tweet.link_title || 'Link preview'}
                                            className="rounded-md max-h-32 object-cover mb-2"
                                        />
                                    )}
                                    <p className="font-medium">{tweet.link_title || tweet.link}</p>
                                    <p className="text-sm text-muted-foreground truncate">{tweet.link}</p>
                                </a>
                            )}

                            <p className="text-xs text-muted-foreground">
                                {new Date(tweet.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No tweets yet</p>
                )}
            </div>
        </div>
    )
} 