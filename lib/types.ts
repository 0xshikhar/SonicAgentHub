export interface Agent {
    id: string;
    name: string;
    description: string;
    category: 'Trading' | 'Social' | 'DeFi' | 'NFT' | 'Gaming' | 'DAO';
    chains: string[];
    version: string;
    score: number;
    imageUrl: string;
    contractAddress: string;
    twitter?: string;
    website?: string;
    mainContract?: string;
    stats: {
        users: number;
        transactions: number;
        volume: number;
    };
    features?: string[];
    metrics?: AgentMetric[];
    reviews?: AgentReview[];
}

export interface AgentMetric {
    label: string;
    value: string;
    change: number;
    timeframe: string;
}

export interface AgentReview {
    id: string;
    user: {
        name: string;
        avatar: string;
        role: string;
    };
    rating: number;
    comment: string;
    date: string;
}