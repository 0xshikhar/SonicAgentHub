# Twitter Agent Creation with Supabase

This document explains the implementation of Twitter agent creation in the Agent Chain platform using Supabase.

## Overview

The Twitter agent creation feature allows users to create AI agents based on Twitter profiles. The implementation includes:

1. Fetching Twitter user information
2. Retrieving tweets from the user
3. Creating a wallet for the agent
4. Generating AI-based profile data (life goals, skills, life context)
5. Saving all data to Supabase

## Key Components

### 1. API Route

The main API route for creating Twitter agents is located at:
```
app/api/users/create/route.ts
```

This route handles the entire process of creating a new Twitter agent.

### 2. Database Functions

All database operations are performed using Supabase. The functions are defined in:
```
lib/supabase-db.ts
```

This file replaces the previous PostgreSQL implementation with Supabase client functions.

### 3. Twitter Data Fetching

Twitter data is fetched using the functions in:
```
lib/socialData.ts
```

For development purposes, these functions return mock data to avoid API costs.

### 4. Wallet Creation

Wallet functionality is implemented in:
```
lib/web3functions.ts
```

This includes creating a new wallet and sending initial funds to it.

### 5. AI Profile Generation

AI-based profile data is generated using the functions in:
```
lib/prompts.ts
```

## Implementation Details

### Twitter User Information

The `getTwitterUserInfo` function fetches information about a Twitter user:
- In development: Returns mock data
- In production: Makes API calls to Twitter

### Tweets Retrieval

The `getTweetsFromUser` function retrieves tweets from a user:
- In development: Generates mock tweets
- In production: Makes API calls to Twitter

### Wallet Creation

The `createAndSaveNewWallet` function creates a new wallet for the agent:
- Creates a random Ethereum wallet
- Saves the wallet information to Supabase

### AI Profile Generation

Three main functions generate AI-based profile data:
- `getLifeGoals`: Generates life goals based on tweets
- `generateUserInitialSkillLevels`: Generates skill levels based on tweets
- `generateUserInitialLifeAdditionalContext`: Generates life context based on tweets and profile

### Database Storage

All data is stored in Supabase tables:
- `agent_chain_users`: Stores agent profiles
- `agent_chain_saved_tweets`: Stores tweets from Twitter
- `agent_chain_wallets`: Stores wallet information

## Usage

To create a new Twitter agent, make a POST request to `/api/users/create` with the following payload:

```json
{
  "handle": "twitterHandle"
}
```

The response will include the created agent profile:

```json
{
  "success": true,
  "profile": {
    "handle": "twitterHandle",
    "display_name": "Twitter User",
    "profile_picture": "https://...",
    "cover_picture": "https://...",
    "twitter_id": "12345678",
    "bio": "User bio",
    "life_goals": "...",
    "skills": "...",
    "life_context": "..."
  }
}
```

## Error Handling

The implementation includes comprehensive error handling:
- All functions catch and log errors
- Error messages are posted to Discord for monitoring
- Appropriate error responses are returned to the client

## Future Improvements

1. Implement real Twitter API calls for production
2. Add more sophisticated AI profile generation
3. Implement rate limiting for API calls
4. Add more detailed error handling and logging
5. Implement caching for frequently accessed data 