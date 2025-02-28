import { Agent } from './types';

/**
 * Interface for the agent format used in the main folder
 */
export interface MainAgent {
    id: string;
    name: string;
    description: string;
    type: 'twitter' | 'character';
    profileImage: string;
    systemPrompt?: string;
}

/**
 * Determines the appropriate category based on agent type and characteristics
 */
function determineAgentCategory(type: string, name: string, description: string): 'Trading' | 'Social' | 'DeFi' | 'NFT' | 'Gaming' | 'DAO' {
    // Default to Social for most agents
    let category: 'Trading' | 'Social' | 'DeFi' | 'NFT' | 'Gaming' | 'DAO' = 'Social';
    
    // Check for trading-related keywords
    if (
        type.toLowerCase().includes('trading') || 
        name.toLowerCase().includes('trade') || 
        description.toLowerCase().includes('trading') ||
        description.toLowerCase().includes('market analysis') ||
        description.toLowerCase().includes('investment')
    ) {
        category = 'Trading';
    }
    
    // Check for DeFi-related keywords
    else if (
        type.toLowerCase().includes('defi') || 
        name.toLowerCase().includes('defi') || 
        description.toLowerCase().includes('defi') ||
        description.toLowerCase().includes('decentralized finance') ||
        description.toLowerCase().includes('yield')
    ) {
        category = 'DeFi';
    }
    
    // Check for NFT-related keywords
    else if (
        type.toLowerCase().includes('nft') || 
        name.toLowerCase().includes('nft') || 
        description.toLowerCase().includes('nft') ||
        description.toLowerCase().includes('collectible')
    ) {
        category = 'NFT';
    }
    
    // Check for Gaming-related keywords
    else if (
        type.toLowerCase().includes('gaming') || 
        name.toLowerCase().includes('game') || 
        description.toLowerCase().includes('gaming') ||
        description.toLowerCase().includes('player')
    ) {
        category = 'Gaming';
    }
    
    // Check for DAO-related keywords
    else if (
        type.toLowerCase().includes('dao') || 
        name.toLowerCase().includes('dao') || 
        description.toLowerCase().includes('dao') ||
        description.toLowerCase().includes('governance')
    ) {
        category = 'DAO';
    }
    
    return category;
}

/**
 * Converts a MainAgent to the Agent format used in the constants file
 */
export function convertMainAgentToAgent(mainAgent: MainAgent): Agent {
    const category = determineAgentCategory(
        mainAgent.type, 
        mainAgent.name, 
        mainAgent.description
    );
    
    return {
        id: mainAgent.id,
        name: mainAgent.name,
        description: mainAgent.description,
        category,
        chains: ['ETH', 'Polygon'],
        version: '1.0.0',
        score: 4.5,
        imageUrl: mainAgent.profileImage,
        contractAddress: `0x${mainAgent.id}`,
        twitter: mainAgent.type === 'twitter' ? `@${mainAgent.name.toLowerCase().replace(/\s+/g, '')}` : undefined,
        stats: {
            users: 1000,
            transactions: 10000,
            volume: 500000,
        },
        features: mainAgent.type === 'twitter' 
            ? ['Twitter Analysis', 'Personality Mirroring', 'Content Generation']
            : ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
    };
}

/**
 * Converts an Agent to the MainAgent format
 */
export function convertAgentToMainAgent(agent: Agent): MainAgent {
    const type = agent.twitter ? 'twitter' : 'character';
    
    return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type,
        profileImage: agent.imageUrl || '/logos/custom-bot.jpg',
        systemPrompt: `You are ${agent.name}, an AI agent with the following description: ${agent.description}. 
        ${agent.twitter ? `You are based on a Twitter profile ${agent.twitter}.` : 'You are a custom character with unique traits.'} 
        Respond in a way that matches your personality and expertise.`,
    };
}

/**
 * Creates a new agent from Twitter profile data
 */
export function createAgentFromTwitterProfile({
    handle,
    name,
    description,
    profileImage,
}: {
    handle: string;
    name: string;
    description: string;
    profileImage: string;
}): Agent {
    const category = determineAgentCategory('twitter', name, description);
    
    return {
        id: `twitter-${handle}`,
        name: name || `@${handle}`,
        description: description || `AI agent based on Twitter profile @${handle}`,
        category,
        chains: ['ETH', 'Polygon'],
        version: '1.0.0',
        score: 4.5,
        imageUrl: profileImage || '/logos/twitter.png',
        contractAddress: `0x${handle}`,
        twitter: `@${handle}`,
        stats: {
            users: 0,
            transactions: 0,
            volume: 0,
        },
        features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
    };
}

/**
 * Creates a new agent from character profile data
 */
export function createAgentFromCharacterProfile({
    handle,
    name,
    description,
    profileImage,
    traits = [],
    background = '',
}: {
    handle: string;
    name: string;
    description: string;
    profileImage?: string;
    traits?: string[];
    background?: string;
}): Agent {
    // Combine description with traits and background for better category determination
    const fullDescription = `${description} ${traits.join(' ')} ${background}`;
    const category = determineAgentCategory('character', name, fullDescription);
    
    return {
        id: `character-${handle}`,
        name,
        description,
        category,
        chains: ['ETH', 'Polygon'],
        version: '1.0.0',
        score: 4.5,
        imageUrl: profileImage || '/logos/custom-bot.jpg',
        contractAddress: `0x${handle}`,
        stats: {
            users: 0,
            transactions: 0,
            volume: 0,
        },
        features: ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
    };
} 