import { createServerSupabaseClient, createActionSupabaseClient, createApiSupabaseClient } from './supabase'
import { PAGE_SIZE } from './constants'
import {
    RawUser,
    ActionEvent,
    AgentTweet,
    LifeGoalsChange,
    SkillsChange,
    LifeContextChange,
    SavedTweet,
    FetchedTweet,
} from './types'
import { cleanHandle, goodTwitterImage } from './strings'
import supabase from './supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

// User functions
export async function saveNewUser(profile: RawUser): Promise<boolean> {
    try {
        const handle = cleanHandle(profile.handle)
        console.log(`🔄 saveNewUser: Starting to save user ${handle} to Supabase`)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            console.log(`🔄 saveNewUser: Attempting to create action Supabase client`)
            supabase = await createActionSupabaseClient()
            console.log(`✅ saveNewUser: Successfully created action Supabase client`)
        } catch (error) {
            // If createActionSupabaseClient fails (e.g., in API routes), use the API client
            console.log(`⚠️ saveNewUser: Failed to create action client, falling back to API client`)
            supabase = createApiSupabaseClient()
            console.log(`✅ saveNewUser: Successfully created API Supabase client`)
        }
        
        console.log(`🔄 saveNewUser: Preparing to insert user data for ${handle}`)
        console.log(`🔄 saveNewUser: User data:`, {
            handle,
            display_name: profile.display_name,
            profile_picture: profile.profile_picture ? 'exists' : 'missing',
            twitter_id: profile.twitter_id,
            bio: profile.bio ? 'exists' : 'missing'
        })
        
        // First check if the user already exists to avoid duplicate errors
        const { data: existingUser, error: checkError } = await supabase
            .from('agent_chain_users')
            .select('handle')
            .eq('handle', handle)
            .maybeSingle()
            
        if (checkError) {
            console.error(`❌ saveNewUser: Error checking if user exists: ${handle}:`, checkError)
            // Continue anyway as it might be a permission error
        }
        
        if (existingUser) {
            console.log(`ℹ️ saveNewUser: User ${handle} already exists, updating instead`)
            const { data: updatedData, error: updateError } = await supabase
                .from('agent_chain_users')
                .update({
                    display_name: profile.display_name,
                    profile_picture: goodTwitterImage(profile.profile_picture),
                    twitter_id: profile.twitter_id,
                    cover_picture: profile.cover_picture,
                    bio: profile.bio,
                    life_goals: profile.life_goals,
                    skills: profile.skills,
                    life_context: profile.life_context
                })
                .eq('handle', handle)
                .select()
                
            if (updateError) {
                console.error(`❌ saveNewUser: Error updating user ${handle}:`, updateError)
                return false
            }
            
            console.log(`✅ saveNewUser: Successfully updated user ${handle}`)
            return true
        }
        
        // If user doesn't exist, insert new user
        const { data, error } = await supabase
            .from('agent_chain_users')
            .insert({
                handle,
                display_name: profile.display_name,
                profile_picture: goodTwitterImage(profile.profile_picture),
                twitter_id: profile.twitter_id,
                cover_picture: profile.cover_picture,
                bio: profile.bio,
                life_goals: profile.life_goals,
                skills: profile.skills,
                life_context: profile.life_context
            })
            .select()
        
        if (error) {
            console.error(`❌ saveNewUser: Error inserting user ${handle}:`, error)
            return false
        }
        
        console.log(`✅ saveNewUser: Successfully inserted user ${handle}, response data:`, data)
        return true
    } catch (error) {
        console.error(`❌ saveNewUser: Unexpected error:`, error)
        return false
    }
}

export async function findUserByHandle(handle: string): Promise<RawUser | null> {
    try {
        handle = cleanHandle(handle)
        console.log(`🔍 findUserByHandle: Looking for user ${handle} in Supabase`)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            console.log(`🔄 findUserByHandle: Attempting to create server Supabase client`)
            supabase = await createServerSupabaseClient()
            console.log(`✅ findUserByHandle: Successfully created server Supabase client`)
        } catch (error) {
            // If createServerSupabaseClient fails (e.g., in API routes), use the API client
            console.log(`⚠️ findUserByHandle: Failed to create server client, falling back to API client`)
            supabase = createApiSupabaseClient()
            console.log(`✅ findUserByHandle: Successfully created API Supabase client`)
        }
        
        console.log(`🔄 findUserByHandle: Querying agent_chain_users table for handle: ${handle}`)
        const { data, error } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', handle)
            .single()
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`ℹ️ findUserByHandle: No user found with handle ${handle}`)
            } else {
                console.error(`❌ findUserByHandle: Error querying for user ${handle}:`, error)
            }
            return null
        }
        
        console.log(`✅ findUserByHandle: Found user ${handle}`)
        return data as RawUser
    } catch (error) {
        console.error(`❌ findUserByHandle: Unexpected error:`, error)
        return null
    }
}

export async function getUsers(): Promise<RawUser[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .select('*')
    
    if (error) {
        console.error("Error in getUsers:", error)
        return []
    }
    
    return data as RawUser[]
}

export async function deleteUserByHandle(handle: string): Promise<boolean> {
    try {
        handle = cleanHandle(handle)
        const supabase = await createActionSupabaseClient()
        
        // Delete related records first using transactions
        const deleteRelatedRecords = async () => {
            // Delete tweets
            const { error: tweetsError } = await supabase
                .from('agent_chain_smol_tweets')
                .delete()
                .eq('handle', handle)
            
            if (tweetsError) throw tweetsError
            
            // Delete action events where user is sender
            const { error: fromEventsError } = await supabase
                .from('agent_chain_action_events')
                .delete()
                .eq('from_handle', handle)
            
            if (fromEventsError) throw fromEventsError
            
            // Delete action events where user is receiver
            const { error: toEventsError } = await supabase
                .from('agent_chain_action_events')
                .delete()
                .eq('to_handle', handle)
            
            if (toEventsError) throw toEventsError
            
            // Delete skills updates
            const { error: skillsError } = await supabase
                .from('agent_chain_updates_skills')
                .delete()
                .eq('handle', handle)
            
            if (skillsError) throw skillsError
            
            // Delete life goals updates
            const { error: goalsError } = await supabase
                .from('agent_chain_updates_life_goals')
                .delete()
                .eq('handle', handle)
            
            if (goalsError) throw goalsError
            
            // Delete life context updates
            const { error: contextError } = await supabase
                .from('agent_chain_updates_life_context')
                .delete()
                .eq('handle', handle)
            
            if (contextError) throw contextError
            
            // Delete wallet
            const { error: walletError } = await supabase
                .from('agent_chain_wallets')
                .delete()
                .eq('handle', handle)
            
            if (walletError) throw walletError
            
            // Finally delete the user
            const { error: userError } = await supabase
                .from('agent_chain_users')
                .delete()
                .eq('handle', handle)
            
            if (userError) throw userError
        }
        
        await deleteRelatedRecords()
        console.log(`User deleted: ${handle}`)
        return true
    } catch (error) {
        console.error("Error in deleteUserByHandle:", error)
        return false
    }
}

// Action events functions
export async function saveNewActionEvent(actionEvent: ActionEvent): Promise<string | null> {
    try {
        const supabase = await createActionSupabaseClient()
        const { data, error } = await supabase
            .from('agent_chain_action_events')
            .insert({
                from_handle: actionEvent.from_handle,
                action_type: actionEvent.action_type,
                main_output: actionEvent.main_output,
                story_context: actionEvent.story_context,
                to_handle: actionEvent.to_handle,
                extra_data: actionEvent.extra_data,
                top_level_type: actionEvent.top_level_type
            })
            .select('id')
            .single()
        
        if (error) {
            console.error("Error in saveNewActionEvent:", error)
            return null
        }
        
        return data.id
    } catch (error) {
        console.error("Error in saveNewActionEvent:", error)
        return null
    }
}

export async function getRecentActionEvents(): Promise<ActionEvent[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_action_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    
    if (error) {
        console.error("Error in getRecentActionEvents:", error)
        return []
    }
    
    // Convert string dates to Date objects
    return data?.map((event) => ({
        ...event,
        created_at: new Date(event.created_at || ''),
        top_level_type: event.top_level_type as "individual" | "duet" | "world_event"
    })) as ActionEvent[] || []
}

export async function getActionEventsByHandle(handle: string): Promise<ActionEvent[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_action_events')
        .select('*')
        .eq('from_handle', handle)
    
    if (error) {
        console.error("Error in getActionEventsByHandle:", error)
        return []
    }
    
    // Convert string dates to Date objects
    return data?.map((event) => ({
        ...event,
        created_at: new Date(event.created_at || ''),
        top_level_type: event.top_level_type as "individual" | "duet" | "world_event"
    })) as ActionEvent[] || []
}

// Tweets functions
export async function saveNewAgentTweet(agentTweet: AgentTweet) {
    try {
        const supabase = await createActionSupabaseClient()
        const { data, error } = await supabase
            .from('agent_chain_smol_tweets')
            .insert({
                handle: agentTweet.handle,
                content: agentTweet.content,
                link: agentTweet.link,
                image_url: agentTweet.image_url,
                link_preview_img_url: agentTweet.link_preview_img_url,
                link_title: agentTweet.link_title,
                action_type: agentTweet.action_type,
                action_id: agentTweet.action_id
            })
            .select('id')
            .single()
        
        if (error) {
            console.error("Error in saveNewAgentTweet:", error)
            return null
        }
        
        console.log(`New tweet by ${agentTweet.handle}: ${agentTweet.content.substring(0, 30)}...`)
        return data
    } catch (error) {
        console.error("Error in saveNewAgentTweet:", error)
        return null
    }
}

export async function getRecentAgentTweets() {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_smol_tweets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    
    if (error) {
        console.error("Error in getRecentAgentTweets:", error)
        return []
    }
    
    return data
}

export async function getRecentAgentTweetsWithUserInfo() {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_smol_tweets')
        .select(`
            *,
            agent_chain_users!inner (
                display_name,
                profile_picture
            )
        `)
        .order('created_at', { ascending: false })
        .limit(50)
    
    if (error) {
        console.error("Error in getRecentAgentTweetsWithUserInfo:", error)
        return []
    }
    
    // Transform the data to match the expected format
    return data.map((tweet: any) => ({
        ...tweet,
        display_name: tweet?.agent_chain_users?.display_name, 
        profile_picture: tweet?.agent_chain_users?.profile_picture
    }))
}

export async function getAgentTweetsByHandle(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_smol_tweets')
        .select(`
            *,
            agent_chain_users!inner (
                display_name,
                profile_picture
            )
        `)
        .eq('handle', handle)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
    
    if (error) {
        console.error("Error in getAgentTweetsByHandle:", error)
        return []
    }
    
    // Transform the data to match the expected format
    return data.map((tweet: any) => ({
        ...tweet,
        display_name: tweet?.agent_chain_users?.display_name, 
        profile_picture: tweet?.agent_chain_users?.profile_picture
    }))
}

// Life goals, skills, and context functions
export async function saveNewLifeGoalsChange(lifeGoalsChange: LifeGoalsChange) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_life_goals')
        .insert({
            handle: lifeGoalsChange.handle,
            previous_life_goals: lifeGoalsChange.previous_life_goals,
            new_life_goals: lifeGoalsChange.new_life_goals,
            summary_of_the_changes: lifeGoalsChange.summary_of_the_changes,
            action_id: lifeGoalsChange.action_id
        })
        .select('id')
        .single()
    
    if (error) {
        console.error("Error in saveNewLifeGoalsChange:", error)
        return null
    }
    
    return data
}

export async function updateUserLifeGoals(handle: string, newLifeGoals: string) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .update({ life_goals: newLifeGoals })
        .eq('handle', handle)
        .select()
        .single()
    
    if (error) {
        console.error("Error in updateUserLifeGoals:", error)
        return null
    }
    
    return data
}

export async function saveNewSkillsChange(skillsChange: SkillsChange) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_skills')
        .insert({
            handle: skillsChange.handle,
            previous_skills: skillsChange.previous_skills,
            new_skills: skillsChange.new_skills,
            summary_of_the_changes: skillsChange.summary_of_the_changes,
            action_id: skillsChange.action_id
        })
        .select('id')
        .single()
    
    if (error) {
        console.error("Error in saveNewSkillsChange:", error)
        return null
    }
    
    return data
}

export async function updateUserSkills(handle: string, newSkills: string) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .update({ skills: newSkills })
        .eq('handle', handle)
        .select()
        .single()
    
    if (error) {
        console.error("Error in updateUserSkills:", error)
        return null
    }
    
    return data
}

export async function saveNewLifeContextChange(lifeContextChange: LifeContextChange) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_updates_life_context')
        .insert({
            handle: lifeContextChange.handle,
            previous_life_context: lifeContextChange.previous_life_context,
            new_life_context: lifeContextChange.new_life_context,
            summary_of_the_changes: lifeContextChange.summary_of_the_changes,
            action_id: lifeContextChange.action_id
        })
        .select('id')
        .single()
    
    if (error) {
        console.error("Error in saveNewLifeContextChange:", error)
        return null
    }
    
    return data
}

export async function updateUserLifeContext(handle: string, newLifeContext: string) {
    const supabase = await createActionSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .update({ life_context: newLifeContext })
        .eq('handle', handle)
        .select()
        .single()
    
    if (error) {
        console.error("Error in updateUserLifeContext:", error)
        return null
    }
    
    return data
}

// Saved tweets functions
export async function readIRLTweets({ handle }: { handle: string }): Promise<SavedTweet[]> {
    try {
        handle = cleanHandle(handle)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            supabase = await createServerSupabaseClient()
        } catch (error) {
            // If createServerSupabaseClient fails (e.g., in API routes), use the API client
            supabase = createApiSupabaseClient()
        }
        
        const { data, error } = await supabase
            .from('agent_chain_saved_tweets')
            .select('*')
            .eq('handle', handle)
            .order('posted_at', { ascending: false })
        
        if (error) {
            console.error("Error in readIRLTweets:", error)
            return []
        }
        
        return data as SavedTweet[]
    } catch (error) {
        console.error("Error in readIRLTweets:", error)
        return []
    }
}

export async function saveTwitterProfile(handle: string, profile: any): Promise<boolean> {
    try {
        handle = cleanHandle(handle)
        console.log(`🔄 saveTwitterProfile: Starting to save Twitter profile for ${handle}`)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            console.log(`🔄 saveTwitterProfile: Attempting to create action Supabase client`)
            supabase = await createActionSupabaseClient()
            console.log(`✅ saveTwitterProfile: Successfully created action Supabase client`)
        } catch (error) {
            // If createActionSupabaseClient fails (e.g., in API routes), use the API client
            console.log(`⚠️ saveTwitterProfile: Failed to create action client, falling back to API client`)
            supabase = createApiSupabaseClient()
            console.log(`✅ saveTwitterProfile: Successfully created API Supabase client`)
        }
        
        // Store the complete Twitter profile in the extra_data field of an action event
        console.log(`🔄 saveTwitterProfile: Storing Twitter profile data for ${handle} as an action event`)
        
        const { error } = await supabase
            .from('agent_chain_action_events')
            .insert({
                top_level_type: 'individual',
                action_type: 'twitter_profile_saved',
                main_output: `Twitter profile data saved for @${handle}`,
                from_handle: handle,
                to_handle: null,
                story_context: null,
                extra_data: JSON.stringify({
                    twitter_profile: profile,
                    saved_at: new Date().toISOString()
                }),
                created_at: new Date().toISOString()
            })
            
        if (error) {
            console.error(`❌ saveTwitterProfile: Error saving Twitter profile data:`, error)
            return false
        }
        
        console.log(`✅ saveTwitterProfile: Successfully saved Twitter profile data for ${handle}`)
        return true
    } catch (error) {
        console.error(`❌ saveTwitterProfile: Unexpected error:`, error)
        return false
    }
}

export async function saveIRLTweets({
    handle,
    tweets,
    metadata = {}
}: {
    handle: string;
    tweets: FetchedTweet[];
    metadata?: Record<string, any>;
}) {
    try {
        handle = cleanHandle(handle)
        console.log(`🔄 saveIRLTweets: Starting to save ${tweets.length} tweets for ${handle}`)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            console.log(`🔄 saveIRLTweets: Attempting to create action Supabase client`)
            supabase = await createActionSupabaseClient()
            console.log(`✅ saveIRLTweets: Successfully created action Supabase client`)
        } catch (error) {
            // If createActionSupabaseClient fails (e.g., in API routes), use the API client
            console.log(`⚠️ saveIRLTweets: Failed to create action client, falling back to API client`)
            supabase = createApiSupabaseClient()
            console.log(`✅ saveIRLTweets: Successfully created API Supabase client`)
        }
        
        if (!tweets || tweets.length === 0) {
            console.log(`ℹ️ saveIRLTweets: No tweets to save for ${handle}`)
            return true
        }
        
        console.log(`🔄 saveIRLTweets: Preparing ${tweets.length} tweets for insertion`)
        const tweetsToInsert = tweets.map((tweet) => ({
            id: tweet.id_str, // Use id_str as the primary key
            handle,
            content: tweet.full_text || tweet.text,
            posted_at: tweet.tweet_created_at,
            // Remove extra_data field as it doesn't exist in the table
            created_at: new Date().toISOString()
        }))
        
        console.log(`🔄 saveIRLTweets: Inserting tweets into agent_chain_saved_tweets table`)
        const { data, error } = await supabase
            .from('agent_chain_saved_tweets')
            .insert(tweetsToInsert)
            .select()
        
        if (error) {
            console.error(`❌ saveIRLTweets: Error inserting tweets for ${handle}:`, error)
            return false
        }
        
        console.log(`✅ saveIRLTweets: Successfully saved ${data.length} tweets for ${handle}`)
        
        // Save metadata about the tweet collection as an action event
        try {
            console.log(`🔄 saveIRLTweets: Saving tweet collection metadata for ${handle}`)
            const actionEvent: ActionEvent = {
                from_handle: handle,
                action_type: 'tweets_collection_saved',
                main_output: `Saved ${tweets.length} tweets for @${handle}`,
                extra_data: JSON.stringify({
                    count: tweets.length,
                    first_tweet_id: tweets[0]?.id_str,
                    last_tweet_id: tweets[tweets.length - 1]?.id_str,
                    saved_at: new Date().toISOString(),
                    ...metadata
                }),
                top_level_type: 'individual',
                story_context: null,
                to_handle: null,
                created_at: new Date()
            }
            
            await saveNewActionEvent(actionEvent)
            console.log(`✅ saveIRLTweets: Successfully saved tweet collection metadata for ${handle}`)
        } catch (metadataError) {
            console.error(`⚠️ saveIRLTweets: Error saving tweet collection metadata:`, metadataError)
            // Continue even if metadata saving fails
        }
        
        return true
    } catch (error) {
        console.error(`❌ saveIRLTweets: Unexpected error in saveIRLTweets: ${error instanceof Error ? error.message : String(error)}`)
        console.error(`❌ saveIRLTweets: Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        return false
    }
}

// Wallet functions
export async function getWalletByHandle(handle: string) {
    try {
        handle = cleanHandle(handle)
        console.log(`[DB GET WALLET] Starting wallet retrieval for handle: ${handle}`)
        
        // Always use the API client for Pages Router compatibility
        const supabaseClient = createApiSupabaseClient()
        console.log(`[DB GET WALLET] Using API Supabase client for Pages Router compatibility`)
        console.log(`[DB GET WALLET] Querying agent_chain_wallets table for handle: ${handle}`)
        const { data, error } = await supabaseClient
        .from('agent_chain_wallets')
        .select('*')
        .eq('handle', handle)
        .single()
        
        console.log(`[DB GET WALLET] Query result:`, data, error)
        
        if (error) {
            console.error(`[DB GET WALLET] Error retrieving wallet: ${error.message}`)
            console.error(`[DB GET WALLET] Error details:`, error)
            return null
        }
        
        if (data) {
            console.log(`[DB GET WALLET] Successfully retrieved wallet for ${handle} with address: ${data.address}`)
        } else {
            console.log(`[DB GET WALLET] No wallet found for handle: ${handle}`)
        }
        
        return data
    } catch (error) {
        console.error(`[DB GET WALLET] Unexpected error in getWalletByHandle: ${error instanceof Error ? error.message : String(error)}`)
        console.error(`[DB GET WALLET] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        return null
    }
}

export async function createWallet({
    handle,
    address,
    privateKey,
    permitSignature,
}: {
    handle: string;
    address: string;
    privateKey: string;
    permitSignature: string;
}) {
    try {
        handle = cleanHandle(handle)
        console.log(`[DB WALLET] Creating wallet for handle: ${handle} with address: ${address}`)
        
        // Use the appropriate Supabase client based on context
        let supabase;
        try {
            console.log(`[DB WALLET] Attempting to create action Supabase client`)
            supabase = await createActionSupabaseClient()
            console.log(`[DB WALLET] Successfully created action Supabase client`)
        } catch (error) {
            // If createActionSupabaseClient fails (e.g., in API routes), use the API client
            console.log(`[DB WALLET] Failed to create action Supabase client, falling back to API client`)
            supabase = createApiSupabaseClient()
            console.log(`[DB WALLET] Successfully created API Supabase client`)
        }
        
        // First check if wallet already exists to avoid duplicate errors
        console.log(`[DB WALLET] Checking if wallet already exists for handle: ${handle}`)
        const { data: existingWallet, error: checkError } = await supabase
            .from('agent_chain_wallets')
            .select('*')
            .eq('handle', handle)
            .maybeSingle()
            
        if (checkError) {
            console.error(`[DB WALLET] Error checking for existing wallet: ${checkError.message}`)
            return null
        }
        
        if (existingWallet) {
            console.log(`[DB WALLET] Wallet already exists for handle: ${handle} with address: ${existingWallet.address}`)
            return existingWallet
        }
        
        console.log(`[DB WALLET] No existing wallet found, creating new wallet for handle: ${handle}`)
        
        // Insert the wallet
        const { data, error } = await supabase
            .from('agent_chain_wallets')
            .insert({
                handle,
                address,
                private_key: privateKey,
                permit_signature: permitSignature
            })
            .select()
            .single()
            
        if (error) {
            console.error(`[DB WALLET] Error creating wallet: ${error.message}`)
            console.error(`[DB WALLET] Error details:`, error)
            return null
        }
        
        console.log(`[DB WALLET] Successfully created wallet for handle: ${handle} with address: ${address}`)
        console.log(`[DB WALLET] Wallet data:`, {
            handle: data.handle,
            address: data.address,
            created_at: data.created_at
        })
        
        return data
    } catch (error) {
        console.error(`[DB WALLET] Unexpected error in createWallet: ${error instanceof Error ? error.message : String(error)}`)
        console.error(`[DB WALLET] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
        return null
    }
}

// Additional utility functions
export async function getRandomClone() {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .select('*')
        .limit(1)
        .order('created_at', { ascending: false })
    
    if (error || !data || data.length === 0) {
        console.error("Error in getRandomClone:", error)
        return null
    }
    
    return data[0]
}

export async function findRandomUserNotYou(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .select('handle')
        .neq('handle', handle)
        .limit(1)
        .order('created_at', { ascending: false })
    
    if (error || !data || data.length === 0) {
        console.error("Error in findRandomUserNotYou:", error)
        return null
    }
    
    return data[0]?.handle || null
}

export async function getRecentClones() {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
    
    if (error) {
        console.error("Error in getRecentClones:", error)
        return []
    }
    
    return data
}

export async function getEventsByHandle(handle: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('agent_chain_action_events')
        .select(`
            *,
            agent_chain_smol_tweets!left (
                id
            )
        `)
        .or(`from_handle.eq.${handle},to_handle.eq.${handle}`)
        .order('created_at', { ascending: false })
    
    if (error || !data) {
        console.error("Error in getEventsByHandle:", error)
        return []
    }
    
    // Transform the data to match the expected format
    return data.map((event: any) => ({
        ...event,
        created_at: new Date(event.created_at as string),
        agent_tweet_id: event.agent_chain_smol_tweets?.[0]?.id || null
    }))
} 