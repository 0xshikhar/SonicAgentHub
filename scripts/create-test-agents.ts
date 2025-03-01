// This script creates test Twitter agents by calling the API endpoint
// Usage: bun run scripts/create-test-agents.ts

import axios from 'axios';

// List of test Twitter handles
const testHandles = [
    'elonmusk',
    'vitalikbuterin',
    'naval',
    'balajis',
    'jack'
];

// Define the expected response structure
interface AgentResponse {
    success: boolean;
    profile?: any;
    data?: any;
    error?: string;
}

/**
 * Creates a test agent by calling the API endpoint
 * @param handle Twitter handle to create an agent from
 */
async function createAgent(handle: string): Promise<boolean> {
    console.log(`Creating agent for Twitter handle: @${handle}...`);

    try {
        const response = await axios.post<AgentResponse>(
            'http://localhost:3000/api/users/create',
            { handle }
        );

        if (response.data.success) {
            console.log(`✅ Successfully created agent for @${handle}`);
            const profileData = response.data.profile || response.data.data;
            console.log(`Agent details:`, profileData);
            return true;
        } else {
            console.error(`❌ Failed to create agent for @${handle}: ${response.data.error}`);
            return false;
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            console.error(`❌ Error creating agent for @${handle}: ${error.response.data?.error || error.message}`);
        } else if (error instanceof Error) {
            console.error(`❌ Error creating agent for @${handle}: ${error.message}`);
        } else {
            console.error(`❌ Unknown error creating agent for @${handle}`);
        }
        return false;
    }
}

/**
 * Main function to create all test agents
 */
async function main() {
    console.log('Starting test agent creation...');
    
    let successCount = 0;
    let failureCount = 0;

    // Create agents sequentially with a delay to avoid rate limiting
    for (const handle of testHandles) {
        const success = await createAgent(handle);
        if (success) {
            successCount++;
        } else {
            failureCount++;
        }
        // Wait 2 seconds between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Test agent creation complete!');
    console.log(`Summary: ${successCount} agents created successfully, ${failureCount} failed`);
}

// Run the main function
main().catch(error => {
    console.error('Fatal error in test script:', error);
    process.exit(1);
}); 