// Script to populate test data directly into the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

// Get the Twitter handle from command line arguments or use default
const twitterHandle = process.argv[2] || 'vitalikbuterin';

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateTestData(handle = twitterHandle) {
  console.log(`🔄 Starting to populate test data for ${handle}`);
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('agent_chain_users')
      .select('*')
      .eq('handle', handle)
      .single();
    
    if (existingUser) {
      console.log(`ℹ️ User ${handle} already exists in the database`);
    } else {
      console.log(`🆕 Creating new user for ${handle}`);
      
      // Create mock user data
      const userData = {
        handle: handle,
        display_name: handle.charAt(0).toUpperCase() + handle.slice(1),
        profile_picture: `https://ui-avatars.com/api/?name=${handle}&background=random&size=200`,
        cover_picture: `https://picsum.photos/seed/${handle}/800/200`,
        twitter_id: '12345678',
        bio: `This is a mock profile for ${handle}`,
        skills: JSON.stringify([
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
        ]),
        life_goals: `* 🌐 **Decentralize the Web:** Create a more open and accessible internet through blockchain technology.
* 🧩 **Solve Scalability:** Develop solutions that make blockchain technology viable for mainstream adoption.
* 🔒 **Enhance Privacy:** Create systems that protect user data while maintaining transparency where needed.`,
        life_context: JSON.stringify({
          one_liner: `${handle} is a visionary in the blockchain space`,
          relationship_status_code: "single",
          city_name: "Crypto City",
          country_emoji: "🌐",
          current_job_title: "Blockchain Developer",
          weekly_jobs_income: 1000,
          weekly_jobs_income_explained: "Income from blockchain development and consulting",
          weekly_life_expenses: 500,
          weekly_life_expenses_explained: "Living expenses in a tech hub"
        })
      };
      
      // Insert user into database
      const { data: insertedUser, error: userError } = await supabase
        .from('agent_chain_users')
        .insert([userData])
        .select();
      
      if (userError) {
        console.error('❌ Error creating user:', userError);
      } else {
        console.log('✅ User created successfully:', insertedUser[0].handle);
      }
    }
    
    // Create Twitter profile data in action_events table
    console.log(`🔄 Creating Twitter profile data for ${handle}`);
    
    const twitterProfileData = {
      from_handle: handle,
      to_handle: null,
      action_type: 'twitter_profile_data',
      action_data: JSON.stringify({
        id: 12345678,
        id_str: "12345678",
        name: handle.charAt(0).toUpperCase() + handle.slice(1),
        screen_name: handle,
        location: "Internet",
        url: `https://twitter.com/${handle}`,
        description: `This is a mock profile for ${handle}`,
        protected: false,
        verified: Math.random() > 0.7,
        followers_count: Math.floor(10000 + Math.random() * 990000),
        friends_count: Math.floor(500 + Math.random() * 4500),
        listed_count: Math.floor(10 + Math.random() * 90),
        favourites_count: Math.floor(1000 + Math.random() * 9000),
        statuses_count: Math.floor(5000 + Math.random() * 15000),
        created_at: new Date(2010 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
        profile_banner_url: `https://picsum.photos/seed/${handle}/800/200`,
        profile_image_url_https: `https://ui-avatars.com/api/?name=${handle}&background=random&size=200`,
        default_profile: false,
        default_profile_image: false,
        withheld_in_countries: [],
        withheld_scope: "",
        can_dm: false
      })
    };
    
    const { error: profileError } = await supabase
      .from('agent_chain_action_events')
      .insert([twitterProfileData]);
    
    if (profileError) {
      console.error('❌ Error saving Twitter profile data:', profileError);
    } else {
      console.log('✅ Twitter profile data saved successfully');
    }
    
    // Create mock tweets
    console.log(`🔄 Creating mock tweets for ${handle}`);
    
    const mockTweets = [];
    for (let i = 1; i <= 10; i++) {
      const tweetDate = new Date();
      tweetDate.setDate(tweetDate.getDate() - i);
      
      const tweetId = `${handle}-tweet-${i}`;
      
      mockTweets.push({
        handle: handle,
        tweet_id: tweetId,
        tweet_text: `This is mock tweet #${i} from ${handle}. #mockdata #testing #ai #blockchain`,
        tweet_created_at: tweetDate.toISOString(),
        likes_count: Math.floor(Math.random() * 100),
        replies_count: Math.floor(Math.random() * 20),
        retweets_count: Math.floor(Math.random() * 50),
        quotes_count: Math.floor(Math.random() * 10),
        tweet_data: JSON.stringify({
          id: tweetId,
          id_str: tweetId,
          user_handle: handle,
          text: `This is mock tweet #${i} from ${handle}`,
          full_text: `This is a longer version of mock tweet #${i} from ${handle}. #mockdata #testing #ai #blockchain`,
          tweet_created_at: tweetDate.toISOString(),
          favorite_count: Math.floor(Math.random() * 100),
          reply_count: Math.floor(Math.random() * 20),
          retweet_count: Math.floor(Math.random() * 50),
          quote_count: Math.floor(Math.random() * 10),
          user: {
            screen_name: handle,
            profile_image_url_https: `https://ui-avatars.com/api/?name=${handle}&background=random`
          },
          user__screen_name: handle,
          user__profile_image_url_https: `https://ui-avatars.com/api/?name=${handle}&background=random`,
          sentiment: ["positive", "negative", "neutral"][Math.floor(Math.random() * 3)],
          emotional_tone: ["happy", "sad", "angry", "excited"][Math.floor(Math.random() * 4)],
          optimism_score: Math.random(),
          toxicity_level: Math.random() * 0.3,
          subjectivity: Math.random(),
          topic_categorization: ["tech", "politics", "entertainment", "sports"][Math.floor(Math.random() * 4)],
          language_complexity: Math.random() * 10,
          engagement_potential: Math.random(),
          humor_or_sarcasm: Math.random() > 0.7 ? "humor" : "none",
          polarity_intensity: Math.random(),
          hashtags: ["mockdata", "testing", "ai", "blockchain"],
          urls: [`https://example.com/${handle}/tweet/${i}`],
          media: i % 3 === 0 ? [{
            type: "photo",
            url: `https://picsum.photos/seed/${handle}-${i}/400/300`
          }] : []
        })
      });
    }
    
    const { error: tweetsError } = await supabase
      .from('agent_chain_saved_tweets')
      .insert(mockTweets);
    
    if (tweetsError) {
      console.error('❌ Error saving tweets:', tweetsError);
    } else {
      console.log(`✅ Successfully saved ${mockTweets.length} tweets`);
    }
    
    // Create tweet collection metadata
    console.log(`🔄 Creating tweet collection metadata for ${handle}`);
    
    const tweetCollectionData = {
      from_handle: handle,
      to_handle: null,
      action_type: 'tweet_collection_metadata',
      action_data: JSON.stringify({
        handle: handle,
        tweets_count: mockTweets.length,
        tweet_ids: mockTweets.map(tweet => tweet.tweet_id),
        collection_date: new Date().toISOString()
      })
    };
    
    const { error: collectionError } = await supabase
      .from('agent_chain_action_events')
      .insert([tweetCollectionData]);
    
    if (collectionError) {
      console.error('❌ Error saving tweet collection metadata:', collectionError);
    } else {
      console.log('✅ Tweet collection metadata saved successfully');
    }
    
    // Create wallet for the user
    console.log(`🔄 Creating wallet for ${handle}`);
    
    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from('agent_chain_wallets')
      .select('*')
      .eq('handle', handle)
      .single();
    
    if (existingWallet) {
      console.log(`ℹ️ Wallet already exists for ${handle}`);
    } else {
      // Create a random wallet
      const wallet = ethers.Wallet.createRandom();
      console.log(`Created random wallet for ${handle}: ${wallet.address}`);
      
      const walletData = {
        handle: handle,
        address: wallet.address,
        private_key: wallet.privateKey,
        created_at: new Date().toISOString()
      };
      
      const { error: walletError } = await supabase
        .from('agent_chain_wallets')
        .insert([walletData]);
      
      if (walletError) {
        console.error('❌ Error creating wallet:', walletError);
      } else {
        console.log('✅ Wallet created successfully');
      }
    }
    
    console.log(`✅ Test data population completed for ${handle}`);
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
  }
}

// Run the function
populateTestData()
  .then(() => {
    console.log('✅ Script execution completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }); 