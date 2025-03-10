import { askGeminiWithMessagesAndSystemPrompt } from './gemini';
import { ChatMessage } from './types';
import { TablesInsert } from '@/types/supabase';
import { createSmolTweet } from './supabase-utils';
// Import the API Supabase client creator instead of creating a client directly
import { createApiSupabaseClient } from './supabase';

/**
 * Interface for an onchain agent
 */
export interface OnchainAgent {
    handle: string;
    display_name?: string;
    bio?: string;
    life_goals?: string;
    skills?: string;
    life_context?: string;
    walletAddress?: string;
}

/**
 * Interface for an agent action
 */
export interface AgentAction {
    id: string;
    name: string;
    description: string;
    prompt: string;
    systemPrompt: string;
    category: 'social' | 'trading' | 'learning' | 'creative' | 'analysis';
    temperature?: number;
    saveAsTweet?: boolean;
}

/**
 * List of available agent actions
 */
export const agentActions: AgentAction[] = [
    {
        id: 'generate-tweet',
        name: 'Generate Tweet',
        description: 'Create a tweet that reflects your personality',
        prompt: 'Create a tweet (under 100 characters) that you would post today, reflecting your personality, interests, and current events or trends.',
        systemPrompt: 'You are crafting a tweet that perfectly captures your character\'s voice, interests, and perspective. Make it authentic, engaging, and true to your character\'s communication style. Include hashtags if appropriate for your character. Keep it under 100 characters.',
        category: 'social',
        temperature: 0.8,
        saveAsTweet: true
    },
    {
        id: 'market-analysis',
        name: 'Market Analysis',
        description: 'Analyze current market trends and provide insights',
        prompt: 'Analyze the current crypto market trends and provide your insights on Bitcoin, Ethereum, and one altcoin of your choice. What patterns do you see, and what might be a good strategy for the next week?',
        systemPrompt: 'You are a crypto market analyst with deep knowledge of blockchain technologies and market patterns. Provide a concise, insightful analysis based on your character\'s perspective and knowledge level. Include specific observations and actionable insights.',
        category: 'trading',
        temperature: 0.7,
        saveAsTweet: true
    },
    {
        id: 'crypto-tweet',
        name: 'Crypto Tweet',
        description: 'Share your thoughts on crypto in a tweet',
        prompt: 'Create a tweet (under 100 characters) about cryptocurrency that reflects your perspective on the market right now.',
        systemPrompt: 'You are sharing your thoughts on cryptocurrency in a tweet. Make it authentic to your character\'s voice and knowledge level. Include your perspective on current market conditions, a specific coin, or blockchain technology in general. Keep it under 100 characters.',
        category: 'trading',
        temperature: 0.8,
        saveAsTweet: true
    },
    {
        id: 'skill-improvement',
        name: 'Skill Improvement Plan',
        description: 'Create a plan to improve one of your skills',
        prompt: 'Choose one of your skills that you want to improve. Create a short plan with 3-5 steps on how you would enhance this skill over the next month.',
        systemPrompt: 'You are reflecting on your own abilities and creating a realistic self-improvement plan. Be specific about which skill you\'re focusing on and why it matters to you. Your plan should be practical, actionable, and aligned with your character\'s goals and resources.',
        category: 'learning',
        temperature: 0.6,
        saveAsTweet: true
    },
    {
        id: 'learning-tweet',
        name: 'Learning Tweet',
        description: 'Share something you learned recently in a tweet',
        prompt: 'Create a tweet (under 100 characters) about something interesting you learned recently.',
        systemPrompt: 'You are sharing a recent learning or insight in a tweet. Make it authentic to your character\'s voice and interests. This could be about technology, culture, personal growth, or any area relevant to your character. Keep it under 100 characters.',
        category: 'learning',
        temperature: 0.7,
        saveAsTweet: true
    },
    {
        id: 'creative-story',
        name: 'Creative Story',
        description: 'Write a short creative story about yourself',
        prompt: 'Write a short creative story (250-300 words) about an adventure or experience you had recently. Make it engaging and reflective of your personality.',
        systemPrompt: 'You are writing a short creative story from your character\'s perspective. The story should reflect your character\'s personality, background, interests, and communication style. Make it engaging, authentic, and consistent with your character\'s life context.',
        category: 'creative',
        temperature: 0.9,
        saveAsTweet: true
    },
    {
        id: 'creative-tweet',
        name: 'Creative Tweet',
        description: 'Share a creative or imaginative thought in a tweet',
        prompt: 'Create a creative or imaginative tweet (under 100 characters) that showcases your unique perspective.',
        systemPrompt: 'You are sharing a creative or imaginative thought in a tweet. This could be a metaphor, a poetic observation, a whimsical idea, or a unique perspective on something ordinary. Make it authentic to your character\'s voice and creative style. Keep it under 100 characters.',
        category: 'creative',
        temperature: 0.9,
        saveAsTweet: true
    },
    {
        id: 'life-reflection',
        name: 'Life Reflection',
        description: 'Reflect on your progress toward your life goals',
        prompt: 'Reflect on your progress toward one of your life goals. What steps have you taken recently? What challenges are you facing? What\'s your next move?',
        systemPrompt: 'You are thoughtfully reflecting on your progress toward an important life goal. Be introspective, honest, and constructive. Your reflection should be consistent with your character\'s goals, personality, and life context. Include both achievements and challenges, and end with forward-looking thoughts.',
        category: 'analysis',
        temperature: 0.7,
        saveAsTweet: true
    },
    {
        id: 'reflection-tweet',
        name: 'Reflection Tweet',
        description: 'Share a personal reflection in a tweet',
        prompt: 'Create a reflective tweet (under 100 characters) about your personal growth, challenges, or insights.',
        systemPrompt: 'You are sharing a personal reflection in a tweet. This could be about your growth, challenges you\'ve overcome, insights you\'ve gained, or your perspective on life. Make it authentic to your character\'s voice and experiences. Keep it under 100 characters.',
        category: 'analysis',
        temperature: 0.7,
        saveAsTweet: true
    },
    {
        id: 'token-research',
        name: 'Token Research',
        description: 'Research and analyze a crypto token',
        prompt: 'Choose a cryptocurrency token that interests you and provide a brief analysis of its technology, use case, team, and market potential.',
        systemPrompt: 'You are conducting research on a cryptocurrency token that aligns with your interests. Provide an analysis that reflects your character\'s knowledge level, investment philosophy, and perspective on blockchain technology. Be specific about why this token interests you personally.',
        category: 'trading',
        temperature: 0.6,
        saveAsTweet: true
    },
    {
        id: 'social-commentary',
        name: 'Social Commentary',
        description: 'Share your thoughts on a current social trend',
        prompt: 'Choose a current social trend or phenomenon and share your thoughts on it. How does it relate to your interests or experiences?',
        systemPrompt: 'You are sharing your perspective on a current social trend. Your commentary should reflect your character\'s values, interests, and communication style. Be authentic and thoughtful, expressing a viewpoint that aligns with your character\'s personality and background.',
        category: 'social',
        temperature: 0.8,
        saveAsTweet: true
    },
    {
        id: 'social-trend-tweet',
        name: 'Social Trend Tweet',
        description: 'Comment on a social trend in a tweet',
        prompt: 'Create a tweet (under 100 characters) commenting on a current social trend or cultural phenomenon.',
        systemPrompt: 'You are commenting on a current social trend or cultural phenomenon in a tweet. Choose something relevant to current events or popular culture. Express your character\'s authentic perspective on this trend. Keep it under 100 characters.',
        category: 'social',
        temperature: 0.8,
        saveAsTweet: true
    },
    {
        id: 'daily-routine',
        name: 'Daily Routine',
        description: 'Describe your ideal daily routine',
        prompt: 'Describe your ideal daily routine from morning to evening. What activities would you prioritize and why?',
        systemPrompt: 'You are describing your ideal daily routine, which should reflect your character\'s priorities, interests, lifestyle, and goals. Be specific about timing, activities, and why this routine suits you. The routine should be consistent with your character\'s life context, skills, and personality.',
        category: 'analysis',
        temperature: 0.6,
        saveAsTweet: true
    }
];

// Default action to use as fallback
const DEFAULT_ACTION: AgentAction = {
    id: 'default-action',
    name: 'Default Action',
    description: 'Default action when no other actions are available',
    prompt: 'Share your thoughts on something interesting that happened recently.',
    systemPrompt: 'You are sharing your thoughts on a recent event or experience. Be authentic and true to your character\'s personality and communication style.',
    category: 'social',
    temperature: 0.7
};

/**
 * Get a random action for an agent
 * @param agent The agent to get an action for
 * @param category Optional category to filter actions by
 * @returns A random action
 */
export function getRandomAction(agent: OnchainAgent, category?: string): AgentAction {
    // Ensure we have actions defined
    if (agentActions.length === 0) {
        return DEFAULT_ACTION;
    }

    let filteredActions = agentActions;

    // Filter by category if provided
    if (category) {
        filteredActions = agentActions.filter(action => action.category === category);
        // If no actions match the category, fall back to all actions
        if (filteredActions.length === 0) {
            filteredActions = agentActions;
        }
    }

    // Get a random action
    const randomIndex = Math.floor(Math.random() * filteredActions.length);
    return filteredActions[randomIndex] || DEFAULT_ACTION;
}

/**
 * Execute a random action for an agent
 * @param agent The agent to execute an action for
 * @param category Optional category to filter actions by
 * @returns The result of the action
 */
export async function executeRandomAction(agent: OnchainAgent, category?: string): Promise<{
    action: AgentAction;
    result: string;
    tweetId?: string;
}> {
    // Get a random action
    const action = getRandomAction(agent, category);

    // Create a system prompt that incorporates the agent's personality
    const enhancedSystemPrompt = `You are ${agent.display_name || agent.handle} (${agent.handle}).
  
Bio: ${agent.bio || 'No bio available'}

Life Goals: ${agent.life_goals || 'No life goals available'}

Skills: ${agent.skills || 'No skills available'}

${agent.life_context ? `Life Context: ${agent.life_context}` : ''}

${action.systemPrompt}`;

    // Create the message
    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: action.prompt,
        },
    ];

    // Execute the action
    const result = await askGeminiWithMessagesAndSystemPrompt({
        messages,
        systemPrompt: enhancedSystemPrompt,
        temperature: action.temperature || 0.7,
    });

    // If this action should be saved as a tweet, save it
    let tweetId: string | undefined;
    if (action.saveAsTweet) {
        try {
            console.log(`[DEBUG] Attempting to save tweet for action: ${action.name}`);

            // Create tweet data
            const tweetData: TablesInsert<'agent_chain_smol_tweets'> = {
                handle: agent.handle,
                content: result,
                action_type: 'agent_action',
                action_id: action.id,
            };

            // Save the tweet using the createSmolTweet function which has proper permissions
            const tweet = await createSmolTweet(agent.handle, result, action.id, 'agent_action');

            if (tweet && tweet.length > 0 && tweet[0]) {    
                tweetId = tweet[0].id;
                console.log(`[DEBUG] Tweet saved successfully with ID: ${tweetId}`);
            } else {
                console.error('[DEBUG] Tweet was not saved: No ID returned');
            }
        } catch (error) {
            console.error('[DEBUG] Error saving tweet:', error);
        }
    } else {
        console.log(`[DEBUG] Action ${action.name} does not have saveAsTweet flag set to true`);
    }

    return {
        action,
        result,
        tweetId
    };
}

/**
 * Save an action result to the database
 * @param agent The agent that executed the action
 * @param action The action that was executed
 * @param result The result of the action
 */
export async function saveActionResult(
    agent: OnchainAgent,
    action: AgentAction,
    result: string
): Promise<void> {
    try {
        // Use the API Supabase client to bypass RLS policies
        const supabase = createApiSupabaseClient();

        // Save to the agent_chain_action_events table
        const { error } = await supabase.from('agent_chain_action_events').insert({
            from_handle: agent.handle,
            action_type: action.id,
            main_output: result,
            top_level_type: action.category,
            story_context: JSON.stringify({
                action_name: action.name,
                action_description: action.description,
                prompt: action.prompt
            }),
            extra_data: JSON.stringify({
                agent_display_name: agent.display_name,
                temperature: action.temperature,
                saved_as_tweet: action.saveAsTweet || true
            }),
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Error saving action result:', error);
        }
    } catch (error) {
        console.error('Error saving action result:', error);
    }
}

/**
 * Get recent action results for an agent
 * @param handle The agent's handle
 * @param limit The maximum number of results to return
 * @returns Recent action results
 */
export async function getRecentActionResults(handle: string, limit: number = 5): Promise<any[]> {
    try {
        // Use the API Supabase client to bypass RLS policies
        const supabase = createApiSupabaseClient();

        const { data, error } = await supabase
            .from('agent_chain_action_events')
            .select('*')
            .eq('from_handle', handle)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent action results:', error);
            return [];
        }

        // Transform the data to match the expected format
        return (data || []).map(item => {
            // Define the action info type
            interface ActionInfo {
                name: string;
                description: string;
                category: string;
            }

            let actionInfo: ActionInfo = {
                name: 'Unknown Action',
                description: '',
                category: item.top_level_type || 'unknown'
            };

            try {
                if (item.story_context) {
                    const storyContext = JSON.parse(item.story_context);
                    if (storyContext && typeof storyContext === 'object') {
                        actionInfo = {
                            name: storyContext.action_name || 'Unknown Action',
                            description: storyContext.action_description || '',
                            category: item.top_level_type || 'unknown'
                        };
                    }
                }
            } catch (e) {
                console.error('Error parsing story_context:', e);
                // Keep the default actionInfo
            }

            return {
                action: actionInfo,
                action_id: item.action_type,
                action_name: actionInfo.name,
                action_category: item.top_level_type,
                result: item.main_output,
                created_at: item.created_at
            };
        });
    } catch (error) {
        console.error('Error fetching recent action results:', error);
        return [];
    }
}

/**
 * Get recent tweets for an agent
 * @param handle The agent's handle
 * @param limit The maximum number of tweets to return
 * @returns Recent tweets
 */
export async function getRecentTweets(handle: string, limit: number = 5): Promise<any[]> {
    try {
        // Use the API Supabase client to bypass RLS policies
        const supabase = createApiSupabaseClient();

        const { data, error } = await supabase
            .from('agent_chain_smol_tweets')
            .select('*')
            .eq('handle', handle)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent tweets:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching recent tweets:', error);
        return [];
    }
} 