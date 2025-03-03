import { NextApiRequest, NextApiResponse } from "next"
import { postErrorToDiscord } from "@/lib/discord"
import {
    findUserByHandle,
    readIRLTweets,
    getWalletByHandle,
    saveIRLTweets,
    saveNewUser,
    saveTwitterProfile,
    createWallet,
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
import { ethers } from "ethers"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`🚀 [ADMIN] create-onchain-agent API called with method: ${req.method}`)
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log(`❌ [ADMIN] Method ${req.method} not allowed`)
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        // Extract parameters from request body
        const { twitterHandle, adminAddress } = req.body
        console.log(`🔄 [ADMIN] Received request to create onchain agent for ${twitterHandle}`)
        
        // Variable to store wallet information
        let wallet = null
        
        // Validate parameters
        if (!twitterHandle) {
            console.log(`❌ [ADMIN] Missing required parameter: twitterHandle`)
            return res.status(400).json({ success: false, error: 'Missing required parameter: twitterHandle' })
        }
        
        if (!adminAddress) {
            console.log(`❌ [ADMIN] Missing required parameter: adminAddress`)
            return res.status(400).json({ success: false, error: 'Missing required parameter: adminAddress' })
        }
        
        if (adminAddress !== ADMIN_WALLET_ADDRESS) {
            console.log(`❌ [ADMIN] Unauthorized admin address: ${adminAddress}`)
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }
        
        console.log(`✅ [ADMIN] Admin authorization successful for ${adminAddress}`)
        
        // Check if user already exists
        console.log(`🔍 [ADMIN] Checking if user ${twitterHandle} already exists`)
        const existingUser = await findUserByHandle(twitterHandle)
        
        if (existingUser) {
            console.log(`ℹ️ [ADMIN] User ${twitterHandle} already exists`)
            return res.status(200).json({ 
                success: true, 
                message: `User ${twitterHandle} already exists`,
                profile: existingUser
            })
        }
        
        console.log(`✅ [ADMIN] User ${twitterHandle} does not exist, proceeding with creation`)
        
        // Fetch Twitter profile data
        console.log(`🔄 [ADMIN] Fetching Twitter profile data for ${twitterHandle}`)
        let twitterUser: FetchedTwitterUser | null = null
        
        try {
            twitterUser = await getTwitterUserInfo(twitterHandle)
            console.log(`✅ [ADMIN] Successfully fetched Twitter profile data for ${twitterHandle}`)
        } catch (error) {
            console.log(`⚠️ [ADMIN] Error fetching Twitter profile data for ${twitterHandle}, using mock data`)
            // Create mock Twitter user data
            twitterUser = {
                id: 12345678,
                id_str: '12345678',
                name: twitterHandle.charAt(0).toUpperCase() + twitterHandle.slice(1),
                screen_name: twitterHandle,
                location: 'Crypto World',
                url: `https://twitter.com/${twitterHandle}`,
                description: `This is a mock profile for ${twitterHandle}`,
                protected: false,
                verified: false,
                followers_count: 1000,
                friends_count: 500,
                listed_count: 50,
                favourites_count: 200,
                statuses_count: 1000,
                created_at: new Date().toISOString(),
                profile_banner_url: `https://picsum.photos/seed/${twitterHandle}/800/200`,
                profile_image_url_https: `https://ui-avatars.com/api/?name=${twitterHandle}&background=random&size=200`,
                can_dm: false
            }
        }
        
        // Generate AI-based profile data
        console.log(`🧠 [ADMIN] Generating AI profile data for ${twitterHandle}`)
        
        // Generate bio
        const bio = `This is a mock profile for ${twitterHandle.charAt(0).toUpperCase() + twitterHandle.slice(1)}`
        console.log(`📝 [ADMIN] Generated bio for ${twitterHandle}`)
        
        // Generate life goals
        const lifeGoals = `* 🌐 **Decentralize the Web:** Create a more open and accessible internet through blockchain technology.
* 🧩 **Solve Scalability:** Develop solutions that make blockchain technology viable for mainstream adoption.
* 🔒 **Enhance Privacy:** Create systems that protect user data while maintaining transparency where needed.`
        console.log(`🎯 [ADMIN] Generated life goals for ${twitterHandle}`)
        
        // Generate skills
        const skills = JSON.stringify([
            {
                emoji: "🧠",
                name: "Blockchain Development",
                level: 95,
                description: "Expert in Ethereum and smart contract development"
            },
            {
                emoji: "💻",
                name: "Programming",
                level: 90,
                description: "Proficient in multiple programming languages"
            },
            {
                emoji: "📊",
                name: "Cryptoeconomics",
                level: 85,
                description: "Deep understanding of token economics and incentive structures"
            }
        ])
        console.log(`🔧 [ADMIN] Generated skills for ${twitterHandle}`)
        
        const lifeContext = JSON.stringify({
            one_liner: `${twitterHandle} is a visionary in the blockchain space`,
            relationship_status_code: "single",
            city_name: "Crypto City",
            country_emoji: "🌐",
            current_job_title: "Blockchain Developer",
            weekly_jobs_income: 1000,
            weekly_jobs_income_explained: "Income from blockchain development and consulting",
            weekly_life_expenses: 500,
            weekly_life_expenses_explained: "Living expenses in a tech hub"
        })
        console.log(`🌍 [ADMIN] Generated life context for ${twitterHandle}`)
        
        console.log(`✅ [ADMIN] Successfully generated AI profile data for ${twitterHandle}`)
        
        // Create the user profile
        console.log(`💾 [ADMIN] Saving new onchain agent profile for ${twitterHandle}`)
        
        const newUser: RawUser = {
            handle: twitterHandle,
            display_name: twitterHandle.charAt(0).toUpperCase() + twitterHandle.slice(1),
            profile_picture: twitterUser?.profile_image_url_https || `https://ui-avatars.com/api/?name=${twitterHandle}&background=random`,
            cover_picture: twitterUser?.profile_banner_url || `https://picsum.photos/seed/${twitterHandle}/800/200`,
            twitter_id: twitterUser?.id_str || '12345678',
            bio: bio,
            life_goals: lifeGoals,
            skills: skills,
            life_context: lifeContext
        }
        console.log(`📝 [ADMIN] Prepared user profile for ${twitterHandle}:`, JSON.stringify(newUser, null, 2))

        console.log(`🔄 [ADMIN] Saving user profile to database for ${twitterHandle}`)
        const userSaved = await saveNewUser(newUser)
        if (!userSaved) {
            console.log(`❌ [ADMIN] Failed to save user profile for ${twitterHandle}`)
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to save user profile',
                details: {
                    handle: twitterHandle,
                    step: 'saveNewUser'
                }
            })
        }
        console.log(`✅ [ADMIN] Successfully saved onchain agent profile to database for ${twitterHandle}`)
        
        // Now that the user is saved, save Twitter profile data
        console.log(`💾 [ADMIN] Saving Twitter profile data for ${twitterHandle}`)
        const profileSaved = await saveTwitterProfile(twitterHandle, twitterUser)
        console.log(`${profileSaved ? '✅' : '❌'} [ADMIN] Twitter profile data ${profileSaved ? 'saved' : 'failed to save'} for ${twitterHandle}`)
        
        // Fetch and save tweets
        console.log(`🔄 [ADMIN] Fetching tweets for ${twitterHandle}`)
        let tweets: SavedTweet[] = []
        
        try {
            // Check if we already have tweets for this user
            const existingTweets = await readIRLTweets({ handle: twitterHandle })
            
            if (existingTweets && existingTweets.length > 0) {
                console.log(`ℹ️ [ADMIN] Found ${existingTweets.length} existing tweets for ${twitterHandle}`)
                tweets = existingTweets
            } else {
                console.log(`ℹ️ [ADMIN] No existing tweets found for ${twitterHandle}, fetching new tweets`)
                
                // Fetch tweets from Twitter API
                const fetchedTweets = await getTweetsFromUser(twitterHandle)
                
                if (fetchedTweets && fetchedTweets.allTweets.length > 0) {
                    console.log(`✅ [ADMIN] Successfully fetched ${fetchedTweets.allTweets.length} tweets for ${twitterHandle}`)
                    
                    // Save tweets to database
                    await saveIRLTweets({
                        handle: twitterHandle,
                        tweets: fetchedTweets.allTweets,
                        metadata: { source: 'twitter_api', count: fetchedTweets.allTweets.length }
                    })
                    
                    console.log(`💾 [ADMIN] Saved ${fetchedTweets.allTweets.length} tweets for ${twitterHandle}`)
                } else {
                    console.log(`⚠️ [ADMIN] No tweets found for ${twitterHandle}, using mock data`)
                    
                    // Create mock tweets
                    tweets = [
                        {
                            id: '1',
                            handle: twitterHandle,
                            content: `This is a mock tweet for ${twitterHandle}`,
                            posted_at: new Date().toISOString()
                        }
                    ]
                    
                    // Save mock tweets
                    await saveIRLTweets({
                        handle: twitterHandle,
                        tweets: tweets.map(tweet => ({
                            id: tweet.id,
                            id_str: tweet.id,
                            user_handle: tweet.handle,
                            text: tweet.content,
                            full_text: tweet.content,
                            tweet_created_at: tweet.posted_at,
                            favorite_count: 0,
                            reply_count: 0,
                            retweet_count: 0,
                            quote_count: 0,
                            user: {
                                screen_name: twitterHandle,
                                profile_image_url_https: twitterUser?.profile_image_url_https || ''
                            },
                            user__screen_name: twitterHandle,
                            user__profile_image_url_https: twitterUser?.profile_image_url_https || ''
                        })),
                        metadata: { source: 'mock_data', count: 1 }
                    })
                    
                    console.log(`💾 [ADMIN] Saved ${tweets.length} mock tweets for ${twitterHandle}`)
                }
            }
        } catch (error) {
            console.error(`❌ [ADMIN] Error fetching or saving tweets for ${twitterHandle}:`, error)
            console.log(`⚠️ [ADMIN] Continuing without tweets for ${twitterHandle}`)
        }
        
        // Now that the user is saved, check if wallet exists and create one if it doesn't
        console.log(`🔍 [ADMIN] Checking if wallet exists for ${twitterHandle}`)
        wallet = await getWalletByHandle(twitterHandle)
        
        if (wallet) {
            console.log(`ℹ️ [ADMIN] Wallet already exists for ${twitterHandle}: ${wallet.address}`)
        } else {
            console.log(`ℹ️ [ADMIN] No wallet found for ${twitterHandle}, creating new wallet`)
            
            try {
                // Create a new wallet
                console.log(`🔄 [ADMIN] Creating new wallet for ${twitterHandle}`)
                
                // Generate a new wallet using ethers
                const newWallet = ethers.Wallet.createRandom()
                console.log(`✅ [ADMIN] Generated new wallet with address: ${newWallet.address}`)
                
                // Save the wallet to the database
                const walletResult = await createWallet({
                    handle: twitterHandle,
                    address: newWallet.address,
                    privateKey: newWallet.privateKey,
                    permitSignature: 'pending-signature'
                })
                
                if (walletResult) {
                    console.log(`✅ [ADMIN] Successfully created and saved wallet for ${twitterHandle}: ${newWallet.address}`)
                    wallet = walletResult
                    
                    // Send initial funds to the wallet
                    try {
                        console.log(`🔄 [ADMIN] Sending initial funds to wallet ${newWallet.address}`)
                        const fundsSent = await sendInitialFundsToWallet(newWallet.address)
                        console.log(`${fundsSent ? '✅' : '❌'} [ADMIN] Initial funds ${fundsSent ? 'sent' : 'failed to send'} to wallet ${newWallet.address}`)
                    } catch (fundingError) {
                        console.error(`❌ [ADMIN] Error sending initial funds to wallet:`, fundingError)
                    }
                } else {
                    console.error(`❌ [ADMIN] Failed to save wallet for ${twitterHandle}`)
                }
            } catch (walletError) {
                console.error(`❌ [ADMIN] Error creating wallet for ${twitterHandle}:`, walletError)
                console.log(`⚠️ [ADMIN] Continuing without wallet for ${twitterHandle}`)
            }
        }
        
        // Retrieve the created user profile
        console.log(`🔄 [ADMIN] Retrieving created user profile from database for ${twitterHandle}`)
        const createdUser = await findUserByHandle(twitterHandle)
        if (!createdUser) {
            console.log(`❌ [ADMIN] User was saved but could not be retrieved for ${twitterHandle}`)
            return res.status(500).json({ 
                success: false, 
                error: 'User was saved but could not be retrieved',
                details: {
                    handle: twitterHandle,
                    step: 'findUserByHandle'
                }
            })
        }

        console.log(`✅ [ADMIN] Successfully retrieved created onchain agent from database for ${twitterHandle}`)

        // Return success response with user data
        const response = {
            success: true,
            message: `Successfully created onchain agent for ${twitterHandle}`,
            profile: createdUser,
            details: {
                twitterProfileSaved: !!twitterUser,
                tweetsCount: tweets.length,
                walletCreated: !!wallet,
                walletAddress: wallet && typeof wallet === 'object' ? wallet.address : null
            }
        }
        console.log(`🏁 [ADMIN] Returning success response for ${twitterHandle}:`, JSON.stringify(response, null, 2))
        return res.status(200).json(response)
    } catch (error: any) {
        console.error(`❌ [ADMIN] Error in create-onchain-agent API:`, error)
        
        // Prepare detailed error information
        const errorDetails = {
            message: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code,
            name: error.name
        }
        
        console.error(`📋 [ADMIN] Error details:`, JSON.stringify(errorDetails, null, 2))
        await postErrorToDiscord(`Error in create-onchain-agent API: ${JSON.stringify(errorDetails)}`)
        
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: errorDetails
        })
    }
}
