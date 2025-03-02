require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch')

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log(`Supabase URL available: ${!!supabaseUrl}`)
console.log(`Supabase ANON key available: ${!!supabaseAnonKey}`)
console.log(`Supabase SERVICE key available: ${!!supabaseServiceKey}`)

// Get Twitter handle from command line arguments
const handle = process.argv[2] || 'vitalikbuterin'
console.log(`Testing agent creation for Twitter handle: ${handle}`)

// Base URL for API calls
const baseUrl = 'http://localhost:3000/api'

/**
 * Verify if data for a handle is saved in the database
 * @param {string} handle - The Twitter handle to verify
 */
async function verifyDataSaved(handle) {
    try {
        const verifyUrl = `${baseUrl}/admin/verify-agent-data?handle=${handle}&adminAddress=${ADMIN_WALLET_ADDRESS}`
        const response = await fetch(verifyUrl)
        const data = await response.json()
        
        console.log('\n📊 Verification Results:')
        console.log(`User Profile: ${data.userExists ? '✅ Found' : '❌ Not Found'}`)
        console.log(`Twitter Profile Data: ${data.twitterProfileExists ? '✅ Found' : '❌ Not Found'}`)
        console.log(`Saved Tweets: ${data.savedTweetsCount} tweets found`)
        console.log(`Tweet Collection Metadata: ${data.tweetCollectionExists ? '✅ Found' : '❌ Not Found'}`)
        console.log(`Wallet: ${data.walletExists ? '✅ Found' : '❌ Not Found'}`)
        console.log(`All Data Exists: ${data.allDataExists ? '✅ Yes' : '❌ No'}`)
        
        console.log('Full API response:', JSON.stringify(data, null, 2))
        
        return data
    } catch (error) {
        console.error('Error verifying data:', error)
        return null
    }
}

/**
 * Create an on-chain agent for a Twitter handle
 * @param {string} handle - The Twitter handle to create an agent for
 */
async function createOnChainAgent(handle) {
    try {
        const createUrl = `${baseUrl}/admin/create-onchain-agent`
        const response = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                twitterHandle: handle,
                adminAddress: ADMIN_WALLET_ADDRESS
            })
        })
        
        const data = await response.json()
        
        console.log('Full API response:', JSON.stringify(data, null, 2))
        
        if (data.success) {
            console.log('\n✅ Agent creation successful!')
            console.log('Profile data:')
            console.log(JSON.stringify(data.profile, null, 2))
        } else {
            console.log('\n❌ Agent creation failed:')
            console.log(data.error || 'Unknown error')
        }
        
        return data
    } catch (error) {
        console.error('Error creating agent:', error)
        return null
    }
}

// Main function to run the test
async function runTest() {
    try {
        // First, create the on-chain agent
        await createOnChainAgent(handle)
        
        // Then verify if all data was saved
        await verifyDataSaved(handle)
        
        console.log('\n🏁 Test completed!')
    } catch (error) {
        console.error('Test failed:', error)
    }
}

// Run the test
runTest() 