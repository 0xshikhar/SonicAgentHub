import { NextApiRequest, NextApiResponse } from "next"
import { postErrorToDiscord } from "@/lib/discord"
import {
    findUserByHandle,
    readIRLTweets,
    getWalletByHandle,
    saveIRLTweets,
    saveNewUser,
} from "@/lib/supabase-db"
import { getTwitterUserInfo, getTweetsFromUser } from "@/lib/socialData"
import { FetchedTwitterUser, RawUser, SavedTweet } from "@/lib/types"
import {
    createAndSaveNewWallet,
    sendInitialFundsToWallet,
} from "@/lib/web3functions"
import {
    generateUserInitialLifeAdditionalContext,
    generateUserInitialSkillLevels,
    getLifeGoals,
} from "@/lib/prompts"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { handle } = req.body

        if (!handle) {
            return res.status(400).json({ 
                success: false, 
                error: 'Twitter handle is required' 
            })
        }

        // Validate handle format
        if (typeof handle !== 'string' || handle.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Twitter handle format'
            })
        }

        const cleanHandle = handle.replace('@', '').trim().toLowerCase()
        console.log(`🔍 Processing Twitter handle: ${cleanHandle}`)

        // Check if user already exists
        try {
            const userExists = await findUserByHandle(cleanHandle)
            if (userExists) {
                console.log(`✅ User ${cleanHandle} already exists, returning existing data`)
                return res.status(200).json({ data: userExists, success: true })
            }
        } catch (error) {
            console.error(`⚠️ Error checking if user exists: ${error instanceof Error ? error.message : String(error)}`)
            // Continue with creation even if check fails
        }

        console.log(`🆕 Creating new user for handle: ${cleanHandle}`)
        
        // Get Twitter profile information
        let profile: FetchedTwitterUser
        try {
            const profileData = await getTwitterUserInfo(cleanHandle)
            if (!profileData) {
                console.error(`❌ Twitter user not found for handle: ${cleanHandle}`)
                return res.status(404).json({
                    success: false,
                    error: "Twitter user not found",
                })
            }
            profile = profileData
            console.log(`📱 Retrieved Twitter profile for ${cleanHandle}`)
        } catch (error) {
            console.error(`❌ Error fetching Twitter profile: ${error instanceof Error ? error.message : String(error)}`)
            return res.status(500).json({
                success: false,
                error: "Failed to fetch Twitter profile",
            })
        }

        // Check for existing tweets or fetch new ones
        let savedTweets: SavedTweet[] = []
        try {
            savedTweets = await readIRLTweets({ handle: cleanHandle })
            console.log(`📊 Found ${savedTweets.length} existing tweets for ${cleanHandle}`)
        } catch (error) {
            console.error(`⚠️ Error reading saved tweets: ${error instanceof Error ? error.message : String(error)}`)
            // Continue even if reading tweets fails
        }

        if (!savedTweets || savedTweets.length === 0) {
            try {
                console.log(`🔄 No saved tweets found for ${cleanHandle}, fetching new tweets`)
                const tweets = await getTweetsFromUser(cleanHandle)

                if (!tweets) {
                    console.warn(`⚠️ No tweets found for ${cleanHandle}, continuing with empty tweets`)
                } else {
                    try {
                        await saveIRLTweets({ handle: cleanHandle, tweets: tweets.allTweets })
                        console.log(`💾 Saved ${tweets.allTweets.length} tweets for ${cleanHandle}`)
                    } catch (error) {
                        console.error(`❌ Error saving tweets: ${error instanceof Error ? error.message : String(error)}`)
                        // Continue even if saving tweets fails
                    }
                }
            } catch (error) {
                console.error(`❌ Error fetching tweets: ${error instanceof Error ? error.message : String(error)}`)
                // Continue even if fetching tweets fails
            }
        }

        // Check for existing wallet or create a new one
        let wallet = null
        try {
            wallet = await getWalletByHandle(cleanHandle)
            if (wallet) {
                console.log(`💰 Found existing wallet for ${cleanHandle}: ${wallet.address}`)
            }
        } catch (error) {
            console.error(`⚠️ Error getting wallet: ${error instanceof Error ? error.message : String(error)}`)
            // Continue even if getting wallet fails
        }

        if (!wallet) {
            try {
                console.log(`🔑 No wallet found for ${cleanHandle}, creating new wallet`)
                const walletCreated = await createAndSaveNewWallet(cleanHandle)

                if (!walletCreated) {
                    console.error(`❌ Error creating wallet for ${cleanHandle}`)
                    // Continue without wallet if creation fails
                } else {
                    try {
                        wallet = await getWalletByHandle(cleanHandle)
                        
                        if (wallet && wallet.address) {
                            try {
                                console.log(`💸 Sending initial funds to wallet ${wallet.address} for ${cleanHandle}`)
                                await sendInitialFundsToWallet(wallet.address)
                                console.log(`✅ Successfully sent initial funds to wallet for ${cleanHandle}`)
                            } catch (error) {
                                console.error(`⚠️ Error sending initial funds: ${error instanceof Error ? error.message : String(error)}`)
                                // Continue even if sending funds fails
                            }
                        }
                    } catch (error) {
                        console.error(`⚠️ Error getting created wallet: ${error instanceof Error ? error.message : String(error)}`)
                        // Continue even if getting created wallet fails
                    }
                }
            } catch (error) {
                console.error(`❌ Error in wallet creation process: ${error instanceof Error ? error.message : String(error)}`)
                // Continue even if wallet creation process fails
            }
        }

        // Generate AI-based profile data
        console.log(`🧠 Generating AI-based profile data for ${cleanHandle}`)
        let lifeGoals = "", userSkillLevels = [], userLifeContext = {}
        
        try {
            // Generate AI-based profile data in parallel
            const [lifeGoalsResult, userSkillLevelsResult, userLifeContextResult] = await Promise.all([
                getLifeGoals(cleanHandle).catch(error => {
                    console.error(`⚠️ Error getting life goals: ${error instanceof Error ? error.message : String(error)}`)
                    return "* Explore the digital world\n* Connect with like-minded individuals\n* Share knowledge and insights\n* Learn new technologies\n* Build meaningful relationships"
                }),
                generateUserInitialSkillLevels(cleanHandle).catch(error => {
                    console.error(`⚠️ Error generating skill levels: ${error instanceof Error ? error.message : String(error)}`)
                    return [
                        { emoji: "💻", name: "Digital Presence", level: 70, description: "Maintaining an online identity" },
                        { emoji: "🗣️", name: "Communication", level: 65, description: "Expressing ideas clearly" },
                        { emoji: "🔍", name: "Research", level: 60, description: "Finding information online" },
                        { emoji: "🤝", name: "Networking", level: 55, description: "Building connections" }
                    ]
                }),
                generateUserInitialLifeAdditionalContext(cleanHandle, profile).catch(error => {
                    console.error(`⚠️ Error generating life context: ${error instanceof Error ? error.message : String(error)}`)
                    return {
                        one_liner: "Digital explorer navigating the online world",
                        relationship_status_code: "unknown",
                        city_name: "Internet",
                        country_emoji: "🌐",
                        current_job_title: "Digital Citizen",
                        weekly_jobs_income: 100,
                        weekly_jobs_income_explained: "Basic digital presence income",
                        weekly_life_expenses: 50,
                        weekly_life_expenses_explained: "Digital maintenance costs"
                    }
                })
            ])
            
            lifeGoals = lifeGoalsResult
            userSkillLevels = userSkillLevelsResult
            userLifeContext = userLifeContextResult
            
            console.log(`✅ Successfully generated AI profile data for ${cleanHandle}`)
        } catch (error) {
            console.error(`❌ Error in AI profile generation: ${error instanceof Error ? error.message : String(error)}`)
            // Continue with default values if AI generation fails
        }

        // Create new user profile
        const newUser = {
            handle: cleanHandle,
            display_name: profile.name,
            profile_picture: profile.profile_image_url_https,
            cover_picture: profile.profile_banner_url,
            twitter_id: profile.id_str,
            bio: profile.description,
            life_goals: lifeGoals,
            skills: userSkillLevels,
            life_context: userLifeContext,
        } as RawUser

        // Save the new user to the database
        try {
            console.log(`💾 Saving new user profile for ${cleanHandle}`)
            await saveNewUser(newUser)
            console.log(`✅ Successfully saved user profile to database for ${cleanHandle}`)
        } catch (error) {
            console.error(`❌ Error saving new user: ${error instanceof Error ? error.message : String(error)}`)
            return res.status(500).json({
                success: false,
                error: "Failed to save user profile",
            })
        }

        // Fetch the newly created user
        let user = null
        try {
            user = await findUserByHandle(cleanHandle)
            console.log(`✅ Successfully retrieved created user from database for ${cleanHandle}`)
        } catch (error) {
            console.error(`⚠️ Error fetching created user: ${error instanceof Error ? error.message : String(error)}`)
            // Return the newUser object if fetching fails
            user = newUser
            console.log(`⚠️ Using newUser object as fallback for ${cleanHandle}`)
        }

        console.log(`🎉 Successfully created user for ${cleanHandle}`)
        return res.status(200).json({
            success: true,
            profile: user,
        })
    } catch (error) {
        const errorMsg = `Error in /api/users/create: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${errorMsg}`, error)
        
        try {
            await postErrorToDiscord(`🔴 ${errorMsg}`)
        } catch (discordError) {
            console.error("Failed to post error to Discord:", discordError)
        }
        
        return res.status(500).json({
            success: false,
            error: "Failed to create user",
            details: error instanceof Error ? error.message : "Unknown error"
        })
    }
} 