# Admin Functionality for Agent Chain

This document provides instructions on how to use the admin functionality to create onchain agents in the Agent Chain platform.

## Admin Functionality

### Admin Wallet Address
The admin wallet address is: `0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5`

### Admin UI
The admin interface provides a user-friendly way to manage and monitor the Agent Chain platform:

1. **Dashboard** (`/admin`): Overview of admin functionality with quick links to common tasks
2. **Create Agent** (`/admin/create-agent`): Create new AI agents based on Twitter profiles
3. **Verify Agent** (`/admin/verify-agent`): Check if all required data for an agent exists
4. **Configuration** (`/admin/config`): View environment variables and system settings

### Creating Onchain Agents

#### Via UI
1. Navigate to `/admin/create-agent`
2. Enter the Twitter handle of the user you want to create an agent for
3. Click "Create Agent"

#### Via API
You can create an onchain agent by making a POST request to `/api/admin/create-onchain-agent` with the following parameters:
- `twitterHandle`: The Twitter handle of the user you want to create an agent for
- `adminAddress`: The admin wallet address

Example:
```bash
curl -X POST http://localhost:3000/api/admin/create-onchain-agent \
  -H "Content-Type: application/json" \
  -d '{"twitterHandle": "vitalikbuterin", "adminAddress": "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"}'
```

### Enhanced Data Persistence
The admin agent creation process now saves complete data to minimize future API calls:

1. **Complete Twitter Profile Data**: All Twitter profile information is saved, including follower counts, profile images, and other metadata.
2. **Tweet Data**: A comprehensive collection of tweets is saved, including engagement metrics (likes, retweets, etc.).
3. **Tweet Collection Metadata**: Information about the tweet collection process is saved, including the number of tweets collected and their IDs.
4. **Extended User Profiles**: Detailed user profiles are created with AI-generated content, including skills, life goals, and contextual information.

### Mock Implementation for Testing
For testing purposes, we've implemented mock versions of the APIs that don't require external dependencies:

1. **Mock Data**: The system uses predefined mock data for Twitter profiles and tweets instead of making actual API calls.
2. **Verification API**: A mock verification API is available at `/api/admin/verify-agent-data` that always returns success.
3. **Test Scripts**: You can use the following scripts to test the functionality:
   - `bun run populate:db <handle>`: Populates the database with test data for a given Twitter handle
   - `bun run test:admin-agent <handle>`: Tests the admin agent creation process for a given Twitter handle

### Troubleshooting
- If you encounter issues with the API, check that your `.env.local` file contains all the necessary environment variables.
- Make sure the development server is running before testing the API.
- If you see "User already exists" messages, you can still proceed with the test as the system will use the existing user data.
- For any connection issues, ensure that the RPC_URL in your `.env.local` file is correct and accessible.
- Use the Configuration page in the admin UI to check the status of your environment variables.

## Testing

A comprehensive test script is provided to test the admin agent creation functionality. This script will:

1. Create an onchain agent for a random Twitter handle
2. Verify that all data is properly saved in all required tables
3. Display detailed information about the created agent

To run the test:

1. Start your local development server:
   ```
   bun run dev
   ```

2. In a separate terminal, run the test script:
   ```
   bun run test:admin-agent
   ```

3. The script will output detailed information about:
   - The agent profile created in `agent_chain_users`
   - The Twitter profile data saved in `agent_chain_action_events`
   - The tweets saved in `agent_chain_saved_tweets`
   - The wallet created in `agent_chain_wallets`

4. If any data is missing, the script will indicate which tables need attention

## How It Works

1. The admin functionality verifies that the request is coming from the authorized admin wallet address
2. It fetches the Twitter profile information for the provided handle
3. It creates a wallet for the agent if one doesn't exist
4. It generates AI-based profile data (life goals, skills, etc.)
5. It saves the agent to the `agent_chain_users` database with `source: 'agent_chain_users'` and `agentType: 'twitter'`
6. The agent will appear in the agents list with an "Onchain" badge

## Enhanced Data Persistence

The admin agent creation process now includes enhanced data persistence to avoid unnecessary API calls:

1. **Complete Twitter Profile Data**: The entire Twitter profile data is saved as an action event with type `twitter_profile_saved`. This ensures we have all the data from the Twitter API and don't need to query it again.

2. **Complete Tweet Data**: All tweets are saved with their complete data in the `extra_data` field, not just the basic content. This includes engagement metrics, sentiment analysis, and other metadata.

3. **Tweet Collection Metadata**: Information about each batch of tweets is saved as an action event with type `tweets_collection_saved`, including when they were fetched and how many were saved.

4. **Extended User Profile**: The user profile includes additional Twitter data in the `extra_data` field, such as follower count, friend count, and verification status.

This enhanced data persistence ensures that:
- We minimize calls to external APIs
- We have complete data for analysis and agent training
- We maintain a historical record of all data fetched

## Troubleshooting

- If you're getting an "Unauthorized" error, make sure you're using the correct admin wallet address
- If the Twitter profile can't be found, check that the handle is correct and the profile is public
- If tables are empty after agent creation, run the verification API:
  ```
  GET /api/admin/verify-agent-data?handle=TWITTER_HANDLE&adminAddress=ADMIN_WALLET_ADDRESS
  ```
- Check the server logs for more detailed error information 