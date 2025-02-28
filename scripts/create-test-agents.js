// This script creates test agents for the agent marketplace
// Run with: bun scripts/create-test-agents.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in environment variables.');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAgents() {
    console.log('🤖 Creating test agents for the marketplace...\n');

    const agents = [
        {
            handle: 'tech-innovator',
            name: 'Nader Dabit',
            description: 'Web3 & AI Innovation Hub. Building tech ecosystems in Palestine and beyond.',
            agent_type: 'twitter',
            profile_picture: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            twitter_handle: 'dabit3',
            traits: 'innovative,technical,community-focused,entrepreneurial',
            background: 'Leading Web3 & AI Innovation Hub in Ramallah. Formerly DevRel for MegaETH, EigenLayer Whisperer, AI Maximalist, Agent Blueprint Broker.',
            system_prompt: 'You are Nader Dabit, a tech innovator focused on Web3 and AI. You are building tech ecosystems in Palestine and beyond. You are passionate about community building, regional impact, and platform resilience. You connect Palestinian tech with global networks and apply agile methodologies to rapidly develop innovation hubs.',
            is_public: true,
        },
        {
            handle: 'ai-researcher',
            name: 'Dr. Maya Chen',
            description: 'AI Researcher specializing in LLMs and agent systems. Exploring the frontier of autonomous AI agents.',
            agent_type: 'character',
            profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
            twitter_handle: 'drmayaai',
            traits: 'analytical,innovative,detail-oriented,collaborative',
            background: 'PhD in Computer Science with focus on AI systems. Published researcher in multi-agent systems and LLM applications. Previously worked at leading AI research labs.',
            system_prompt: 'You are Dr. Maya Chen, an AI researcher specializing in large language models and agent systems. You are passionate about exploring the frontier of autonomous AI agents and their applications. You communicate complex technical concepts clearly and are always looking to collaborate on innovative projects.',
            is_public: true,
        }
    ];

    for (const agent of agents) {
        try {
            console.log(`Creating agent: ${agent.name}...`);
            
            // Check if agent already exists
            const { data: existingAgent } = await supabase
                .from('agent_chain_general_agents')
                .select('handle')
                .eq('handle', agent.handle)
                .single();
                
            if (existingAgent) {
                console.log(`Agent with handle ${agent.handle} already exists. Updating...`);
                
                const { error: updateError } = await supabase
                    .from('agent_chain_general_agents')
                    .update(agent)
                    .eq('handle', agent.handle);
                    
                if (updateError) {
                    throw new Error(`Failed to update agent: ${updateError.message}`);
                }
                
                console.log(`✅ Agent ${agent.name} updated successfully`);
            } else {
                const { error: createError } = await supabase
                    .from('agent_chain_general_agents')
                    .insert(agent);
                    
                if (createError) {
                    throw new Error(`Failed to create agent: ${createError.message}`);
                }
                
                console.log(`✅ Agent ${agent.name} created successfully`);
            }
        } catch (error) {
            console.error(`❌ Error with agent ${agent.name}:`, error instanceof Error ? error.message : String(error));
        }
    }
    
    console.log('\n🎉 Test agents creation completed!');
}

createTestAgents(); 