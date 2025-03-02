import { NextApiRequest, NextApiResponse } from "next"
import { postErrorToDiscord } from "@/lib/discord"
import {
    findUserByHandle,
    readIRLTweets,
    getWalletByHandle,
    saveIRLTweets,
    saveNewUser,
    saveTwitterProfile,
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

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        // Extract parameters from request body
        const { twitterHandle, adminAddress } = req.body

        // Validate required parameters
        if (!twitterHandle) {
            return res.status(400).json({ success: false, error: 'Twitter handle is required' })
        }

        // Validate admin address
        if (adminAddress !== ADMIN_WALLET_ADDRESS) {
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }

        console.log(`🔍 [ADMIN] Processing Twitter handle: ${twitterHandle}`)

        // Check if user already exists
        const existingUser = await findUserByHandle(twitterHandle)
        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: `User ${twitterHandle} already exists`,
                profile: existingUser
            })
        }

        console.log(`🆕 [ADMIN] Creating new onchain agent for handle: ${twitterHandle}`)

        // Get Twitter profile information
        let twitterUser: FetchedTwitterUser | null = null;
        try {
            twitterUser = await getTwitterUserInfo(twitterHandle)
            console.log(`🔄 [ADMIN] Attempting to save Twitter profile data for ${twitterHandle}`)
            const profileSaved = await saveTwitterProfile(twitterHandle, twitterUser)
            if (!profileSaved) {
                console.log(`❌ [ADMIN] Twitter profile data failed to save for ${twitterHandle}`)
            }
        } catch (error) {
            console.error(`⚠️ [ADMIN] Failed to save Twitter profile data for ${twitterHandle}`)
        }

        console.log(`📱 [ADMIN] Retrieved Twitter profile for ${twitterHandle}`)

        // Get tweets
        let tweets: SavedTweet[] = []
        try {
            // Check if we already have tweets for this user
            const existingTweets = await readIRLTweets({ handle: twitterHandle })
            console.log(`📊 [ADMIN] Found ${existingTweets.length} existing tweets for ${twitterHandle}`)

            if (existingTweets.length === 0) {
                console.log(`🔄 [ADMIN] No saved tweets found for ${twitterHandle}, fetching new tweets`)
                const tweetsResponse = await getTweetsFromUser(twitterHandle)
                
                if (tweetsResponse && tweetsResponse.allTweets.length > 0) {
                    console.log(`🔄 [ADMIN] Attempting to save ${tweetsResponse.allTweets.length} tweets for ${twitterHandle}`)
                    await saveIRLTweets({
                        handle: twitterHandle,
                        tweets: tweetsResponse.allTweets,
                        metadata: {
                            source: 'admin_api',
                            created_at: new Date().toISOString()
                        }
                    })
                } else {
                    console.log(`❌ [ADMIN] No tweets found for ${twitterHandle}`)
                }
            } else {
                tweets = existingTweets
                console.log(`✅ [ADMIN] Using ${tweets.length} existing tweets for ${twitterHandle}`)
            }
        } catch (error) {
            console.error(`⚠️ [ADMIN] Failed to save tweets for ${twitterHandle}`)
        }

        // Create wallet if it doesn't exist
        let wallet
        try {
            wallet = await getWalletByHandle(twitterHandle)
            console.log(`✅ [ADMIN] Found existing wallet for ${twitterHandle}`)
        } catch (error) {
            console.log(`🔄 [ADMIN] No wallet found for ${twitterHandle}, creating new wallet`)
            try {
                wallet = await createAndSaveNewWallet(twitterHandle)
                console.log(`✅ [ADMIN] Wallet created successfully for ${twitterHandle}`)
            } catch (walletError) {
                await postErrorToDiscord(`Error creating wallet for ${twitterHandle}: ${walletError}`)
                console.error(`❌ [ADMIN] Error creating wallet: ${walletError}`)
            }
        }

        if (!wallet) {
            console.log(`❌ [ADMIN] Wallet not found for ${twitterHandle}`)
        }

        // Generate AI-based profile data
        console.log(`🧠 [ADMIN] Generating AI-based profile data for ${twitterHandle}`)
        
        // For testing, use mock data instead of AI-generated content
        const bio = `This is a mock profile for ${twitterHandle}`
        console.log(`📙 📙 📙 📙  DEBUG: the bio is: `, bio)
        
        const lifeGoals = `* 🌐 **Decentralize the Web:** Create a more open and accessible internet through blockchain technology.
* 🧩 **Solve Scalability:** Develop solutions that make blockchain technology viable for mainstream adoption.
* 🔒 **Enhance Privacy:** Create systems that protect user data while maintaining transparency where needed.`
        
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

        const userSaved = await saveNewUser(newUser)
        if (!userSaved) {
            return res.status(500).json({ success: false, error: 'Failed to save user profile' })
        }

        console.log(`✅ [ADMIN] Successfully saved onchain agent profile to database for ${twitterHandle}`)

        // Get the created user to return in response
        const createdUser = await findUserByHandle(twitterHandle)
        if (!createdUser) {
            return res.status(500).json({ success: false, error: 'User was saved but could not be retrieved' })
        }

        console.log(`✅ [ADMIN] Successfully retrieved created onchain agent from database for ${twitterHandle}`)

        // Return success response with user data
        return res.status(200).json({
            success: true,
            message: `Successfully created onchain agent for ${twitterHandle}`,
            profile: {
                handle: twitterHandle,
                display_name: `${twitterHandle.charAt(0).toUpperCase() + twitterHandle.slice(1)}`,
                profile_picture: `/images/vitalik.jpg`,
                cover_picture: `/images/vitalik.jpg`,
                twitter_id: "12345678",
                bio: `This is a mock profile for ${twitterHandle} agent`,
                life_goals: [
                    "Build innovative blockchain solutions",
                    "Contribute to open-source projects",
                    "Educate others about decentralized technologies",
                    "Create a more equitable financial system",
                    "Foster community-driven development"
                ],
                skills: JSON.stringify([
                    {
                        "name": "Blockchain Development",
                        "level": 9,
                        "description": "Expert in blockchain architecture and smart contract development"
                    },
                    {
                        "name": "Cryptography",
                        "level": 8,
                        "description": "Strong understanding of cryptographic principles and implementations"
                    },
                    {
                        "name": "Technical Writing",
                        "level": 7,
                        "description": "Skilled at explaining complex technical concepts clearly"
                    }
                ]),
                life_context: JSON.stringify({
                    "one_liner": "Blockchain innovator and community builder",
                    "relationship_status": "Single",
                    "city": "Singapore",
                    "country": "Singapore",
                    "job_title": "Blockchain Developer",
                    "income": "$150,000",
                    "expenses": "$80,000"
                })
            }
        })
    } catch (error) {
        console.error('[ADMIN] Error in create-onchain-agent API:', error)
        await postErrorToDiscord(`Error in create-onchain-agent API: ${error}`)
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
} 