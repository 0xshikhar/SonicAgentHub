// This script migrates static agents from constants.ts to the Supabase database
// Usage: bun run scripts/migrate-static-agents.ts

import { agents as staticAgents } from '../lib/constants';
import { createGeneralAgent } from '../lib/supabase-utils';
import { generateCharacterSystemPrompt } from '../lib/services/mock-agent-service';

/**
 * Migrates static agents to the database as character agents
 */
async function migrateStaticAgents() {
    console.log('🚀 Starting migration of static agents to database...');

    let successCount = 0;
    let failureCount = 0;

    for (const agent of staticAgents) {
        try {
            console.log(`Processing agent: ${agent.name} (${agent.id})`);

            // Generate traits from features
            const traits = agent.features || ['Conversational', 'Helpful', 'Knowledgeable'];

            // Generate a system prompt for the character
            const characterData = {
                handle: agent.id,
                name: agent.name,
                description: agent.description,
                traits: traits,
                background: ''
            };

            const systemPrompt = generateCharacterSystemPrompt(characterData);

            // Create the general agent in the database
            const generalAgentData = {
                handle: agent.id,
                name: agent.name,
                description: agent.description,
                agent_type: 'character',
                profile_picture: agent.imageUrl || `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
                traits: traits,
                system_prompt: systemPrompt,
                is_public: true
            };

            console.log(`Creating general agent with data:`, generalAgentData);

            const createdAgent = await createGeneralAgent(generalAgentData);
            console.log(`✅ Successfully migrated agent: ${agent.name}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to migrate agent ${agent.name}:`, error);
            failureCount++;
        }

        // Wait a bit between requests to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🔄 Migration complete!');
    console.log(`✅ Successfully migrated ${successCount} agents`);
    console.log(`❌ Failed to migrate ${failureCount} agents`);
}

// Run the migration
migrateStaticAgents().catch(error => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
}); 