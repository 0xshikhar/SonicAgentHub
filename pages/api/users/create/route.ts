import { postErrorToDiscord } from "@/lib/discord"
import {
  findUserByHandle,
  readIRLTweets,
  getWalletByHandle,
  saveIRLTweets,
  saveNewUser,
} from "@/lib/supabase-db"
import { getTwitterUserInfo, getTweetsFromUser } from "@/lib/socialData"
import { NextResponse } from "next/server"
import { FetchedTwitterUser, RawUser } from "@/lib/types"
import {
  createAndSaveNewWallet,
  sendInitialFundsToWallet,
} from "@/lib/web3functions"
import {
  generateUserInitialLifeAdditionalContext,
  generateUserInitialSkillLevels,
  getLifeGoals,
} from "@/lib/prompts"
import { revalidateTag } from "next/cache"

export async function POST(request: Request) {
  try {
    const { handle } = await request.json()

    // Check if user already exists
    const userExists = await findUserByHandle(handle)
    if (userExists) {
      return NextResponse.json({ data: userExists, success: true })
    } else {
      // Get Twitter profile information
      const profile = await getTwitterUserInfo(handle)

      if (!profile) {
        return NextResponse.json({
          success: false,
          error: "Twitter user not found",
        })
      }

      // Check for existing tweets or fetch new ones
      const savedTweets = await readIRLTweets({ handle })

      if (!savedTweets || savedTweets.length === 0) {
        const tweets = await getTweetsFromUser(handle)

        if (!tweets) {
          return NextResponse.json({
            success: false,
            error: "Tweets not found",
          })
        }

        await saveIRLTweets({ handle, tweets: tweets.allTweets })
      }

      // Check for existing wallet or create a new one
      let wallet = await getWalletByHandle(handle)

      if (!wallet) {
        const walletCreated = await createAndSaveNewWallet(handle)

        if (!walletCreated) {
          return NextResponse.json({
            success: false,
            error: "Error in createAndSaveNewWallet",
          })
        }
        
        wallet = await getWalletByHandle(handle)
        
        if (!wallet) {
          await postErrorToDiscord(
            "🔴 Error (1) generating wallet for the user: " + handle
          )
          return NextResponse.json({
            success: false,
            error: "Error in getWalletByHandle",
          })
        }
        
        if (!wallet.address) {
          await postErrorToDiscord(
            "🔴 Error (2) generating wallet for the user: " + handle
          )
          return NextResponse.json({
            success: false,
            error: "Error in wallet.address",
          })
        }
        
        await sendInitialFundsToWallet(wallet.address)
        revalidateTag(`balance-${handle}`)
      }

      // Generate AI-based profile data in parallel
      const [lifeGoals, userSkillLevels, userLifeContext] = await Promise.all([
        getLifeGoals(handle),
        generateUserInitialSkillLevels(handle),
        generateUserInitialLifeAdditionalContext(handle, profile),
      ])

      // Create new user profile
      const newUser = {
        handle,
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
      await saveNewUser(newUser)

      // Fetch the newly created user
      const user = await findUserByHandle(handle)

      return NextResponse.json({
        success: true,
        profile: user,
      })
    }
  } catch (error) {
    await postErrorToDiscord("🔴 Error in /api/users/create")
    console.error("🔴 Error in /api/users/create:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
} 