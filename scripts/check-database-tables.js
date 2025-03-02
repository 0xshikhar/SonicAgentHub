// Script to check database tables directly
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TWITTER_HANDLE = process.argv[2] || 'vitalikbuterin'; // Get handle from command line or use default

// Check if Supabase credentials are available
if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
    process.exit(1);
}

if (!supabaseKey) {
    console.error('❌ Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is defined in environment variables');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseTables() {
    console.log(`\n🔍 Checking database tables for @${TWITTER_HANDLE}...\n`);
    
    try {
        // Check agent_chain_users
        console.log('📊 Checking agent_chain_users table...');
        const { data: userData, error: userError } = await supabase
            .from('agent_chain_users')
            .select('*')
            .eq('handle', TWITTER_HANDLE)
            .limit(1);
            
        if (userError) {
            console.error(`   ❌ Error querying agent_chain_users: ${userError.message}`);
        } else if (userData && userData.length > 0) {
            console.log(`   ✅ Found user entry for @${TWITTER_HANDLE}`);
            console.log(`      Display name: ${userData[0].display_name}`);
            console.log(`      Bio: ${userData[0].bio ? userData[0].bio.substring(0, 50) + '...' : 'N/A'}`);
        } else {
            console.log(`   ❌ No user entry found for @${TWITTER_HANDLE}`);
        }
        
        // Check agent_chain_action_events for Twitter profile
        console.log('\n📊 Checking agent_chain_action_events table for Twitter profile...');
        const { data: profileData, error: profileError } = await supabase
            .from('agent_chain_action_events')
            .select('*')
            .eq('from_handle', TWITTER_HANDLE)
            .eq('action_type', 'twitter_profile_saved')
            .limit(1);
            
        if (profileError) {
            console.error(`   ❌ Error querying agent_chain_action_events: ${profileError.message}`);
        } else if (profileData && profileData.length > 0) {
            console.log(`   ✅ Found Twitter profile data for @${TWITTER_HANDLE}`);
            console.log(`      Created at: ${profileData[0].created_at}`);
            console.log(`      Has extra_data: ${Boolean(profileData[0].extra_data)}`);
        } else {
            console.log(`   ❌ No Twitter profile data found for @${TWITTER_HANDLE}`);
        }
        
        // Check agent_chain_saved_tweets
        console.log('\n📊 Checking agent_chain_saved_tweets table...');
        const { data: tweetsData, error: tweetsError } = await supabase
            .from('agent_chain_saved_tweets')
            .select('*')
            .eq('handle', TWITTER_HANDLE)
            .limit(10);
            
        if (tweetsError) {
            console.error(`   ❌ Error querying agent_chain_saved_tweets: ${tweetsError.message}`);
        } else if (tweetsData && tweetsData.length > 0) {
            console.log(`   ✅ Found ${tweetsData.length} tweets for @${TWITTER_HANDLE}`);
            console.log(`      First tweet: ${tweetsData[0].content ? tweetsData[0].content.substring(0, 50) + '...' : 'N/A'}`);
        } else {
            console.log(`   ❌ No tweets found for @${TWITTER_HANDLE}`);
        }
        
        // Check agent_chain_wallets
        console.log('\n📊 Checking agent_chain_wallets table...');
        const { data: walletData, error: walletError } = await supabase
            .from('agent_chain_wallets')
            .select('*')
            .eq('handle', TWITTER_HANDLE)
            .limit(1);
            
        if (walletError) {
            console.error(`   ❌ Error querying agent_chain_wallets: ${walletError.message}`);
        } else if (walletData && walletData.length > 0) {
            console.log(`   ✅ Found wallet for @${TWITTER_HANDLE}`);
            console.log(`      Address: ${walletData[0].address}`);
        } else {
            console.log(`   ❌ No wallet found for @${TWITTER_HANDLE}`);
        }
        
        console.log('\n✅ Database check completed!');
    } catch (error) {
        // Handle error safely
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('\n❌ Error checking database tables:', errorMessage);
    }
}

// Run the check
checkDatabaseTables(); 