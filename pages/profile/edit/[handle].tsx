import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import supabase from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { getUserProfileByAddress } from '@/lib/user-utils'
import { setCookie } from 'cookies-next'
import { showToast } from '@/lib/toast'

type UserProfile = Database['public']['Tables']['agent_chain_users']['Row']

// Define the form schema
const profileSchema = z.object({
    display_name: z.string().min(2, 'Display name must be at least 2 characters'),
    bio: z.string().optional(),
    life_goals: z.string(),
    skills: z.string(),
    life_context: z.string(),
    profile_picture: z.string().optional(),
    cover_picture: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
    const router = useRouter()
    const { handle } = router.query
    const { address, isConnected } = useAccount()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initialize form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            display_name: '',
            bio: '',
            life_goals: '',
            skills: '',
            life_context: '',
            profile_picture: '',
            cover_picture: '',
        },
    })

    useEffect(() => {
        // Set wallet-connected cookie for middleware if connected
        if (isConnected && address) {
            setCookie('wallet-connected', 'true', { maxAge: 60 * 60 * 24 }) // 24 hours
        }
    }, [isConnected, address])

    useEffect(() => {
        if (!handle || typeof handle !== 'string') return
        if (!isConnected || !address) {
            router.push('/')
            showToast.error('Please connect your wallet to edit your profile')
            return
        }

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
                const currentUserProfile = await getUserProfileByAddress(address)
                
                if (currentUserProfile?.handle !== handle) {
                    // Not the owner, redirect to profile page
                    showToast.error('You do not have permission to edit this profile')
                    router.push(`/profile/${handle}`)
                    return
                }

                // Set form values
                form.reset({
                    display_name: profile.display_name,
                    bio: profile.bio || '',
                    life_goals: profile.life_goals,
                    skills: profile.skills,
                    life_context: profile.life_context,
                    profile_picture: profile.profile_picture || '',
                    cover_picture: profile.cover_picture || '',
                })
            } catch (error) {
                console.error('Error fetching profile:', error)
                showToast.error('Error loading profile')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserProfile()
    }, [handle, address, isConnected, router, form])

    const onSubmit = async (data: ProfileFormValues) => {
        if (!userProfile || !handle || typeof handle !== 'string') return

        setIsSubmitting(true)
        setError(null)

        try {
            // Update profile
            const { error } = await supabase
                .from('agent_chain_users')
                .update({
                    display_name: data.display_name,
                    bio: data.bio,
                    life_goals: data.life_goals,
                    skills: data.skills,
                    life_context: data.life_context,
                    profile_picture: data.profile_picture,
                    cover_picture: data.cover_picture,
                })
                .eq('handle', handle)

            if (error) throw error

            // Create update records for tracking changes
            if (data.life_context !== userProfile.life_context) {
                await supabase.from('agent_chain_updates_life_context').insert({
                    handle: userProfile.handle,
                    previous_life_context: userProfile.life_context,
                    new_life_context: data.life_context,
                    summary_of_the_changes: 'User updated their life context',
                    action_id: 'manual-update',
                })
            }

            if (data.skills !== userProfile.skills) {
                await supabase.from('agent_chain_updates_skills').insert({
                    handle: userProfile.handle,
                    previous_skills: userProfile.skills,
                    new_skills: data.skills,
                    summary_of_the_changes: 'User updated their skills',
                    action_id: 'manual-update',
                })
            }

            if (data.life_goals !== userProfile.life_goals) {
                await supabase.from('agent_chain_updates_life_goals').insert({
                    handle: userProfile.handle,
                    previous_life_goals: userProfile.life_goals,
                    new_life_goals: data.life_goals,
                    summary_of_the_changes: 'User updated their life goals',
                    action_id: 'manual-update',
                })
            }

            showToast.success('Profile updated successfully')
            
            // Redirect to profile page
            router.push(`/profile/${handle}`)
        } catch (error: any) {
            setError(error.message || 'Failed to update profile')
            showToast.error('Failed to update profile')
        } finally {
            setIsSubmitting(false)
        }
    }

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
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="display_name" className="block font-medium">
                            Display Name
                        </label>
                        <input
                            id="display_name"
                            {...form.register('display_name')}
                            className="w-full p-2 border rounded-md"
                        />
                        {form.formState.errors.display_name && (
                            <p className="text-red-500 text-sm">
                                {form.formState.errors.display_name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="bio" className="block font-medium">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            {...form.register('bio')}
                            rows={3}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="profile_picture" className="block font-medium">
                            Profile Picture URL
                        </label>
                        <input
                            id="profile_picture"
                            {...form.register('profile_picture')}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="cover_picture" className="block font-medium">
                            Cover Picture URL
                        </label>
                        <input
                            id="cover_picture"
                            {...form.register('cover_picture')}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="skills" className="block font-medium">
                            Skills
                        </label>
                        <textarea
                            id="skills"
                            {...form.register('skills')}
                            rows={3}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="life_goals" className="block font-medium">
                            Life Goals
                        </label>
                        <textarea
                            id="life_goals"
                            {...form.register('life_goals')}
                            rows={3}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="life_context" className="block font-medium">
                            Life Context
                        </label>
                        <textarea
                            id="life_context"
                            {...form.register('life_context')}
                            rows={5}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-white rounded-md"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push(`/profile/${handle}`)}
                            className="px-4 py-2 bg-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 