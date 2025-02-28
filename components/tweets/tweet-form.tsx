'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import supabase from '@/lib/supabase'
import { getUserProfileByAddress } from '@/lib/user-utils'
import { showToast } from '@/lib/toast'

interface TweetFormProps {
    onSuccess?: () => void
}

export function TweetForm({ onSuccess }: TweetFormProps) {
    const [content, setContent] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { address, isConnected } = useAccount()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isConnected || !address) {
            setError('Please connect your wallet to post a tweet')
            showToast.error('Please connect your wallet to post a tweet')
            return
        }

        if (!content.trim()) {
            setError('Tweet content cannot be empty')
            showToast.error('Tweet content cannot be empty')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Get the user's profile
            const userProfile = await getUserProfileByAddress(address)

            if (!userProfile?.handle) {
                throw new Error('User profile not found')
            }

            // Create the tweet
            const response = await fetch('/api/tweets/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle: userProfile.handle,
                    content,
                    image_url: imageUrl || null,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create tweet')
            }

            // Reset form
            setContent('')
            setImageUrl('')

            // Call success callback if provided
            if (onSuccess) {
                onSuccess()
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create tweet')
            showToast.error(err.message || 'Failed to create tweet')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-4 bg-card rounded-lg border mb-6">
            <h2 className="text-xl font-semibold mb-4">Post a Tweet</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full p-3 border rounded-md min-h-[100px]"
                        maxLength={280}
                    />
                    <div className="text-right text-sm text-muted-foreground">
                        {content.length}/280
                    </div>
                </div>

                <div>
                    <label htmlFor="image-url" className="block text-sm font-medium mb-1">
                        Image URL (optional)
                    </label>
                    <input
                        id="image-url"
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Tweet'}
                    </button>
                </div>
            </form>
        </div>
    )
} 