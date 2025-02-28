import { Agent } from './types';

export const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'twitter', name: 'Twitter Agents', icon: '🐦' },
    { id: 'character', name: 'Character Agents', icon: '🎭' },
    { id: 'trading', name: 'Trading Agents', icon: '📈' },
    { id: 'social', name: 'Social Agents', icon: '💬' },
    { id: 'politicalLeader', name: 'Political Leader Agents', icon: '🗳️' },
    { id: 'blockchainFounder', name: 'Blockchain Founder Agents', icon: '👨‍💻' },
    { id: 'cartoonHeroes', name: 'Cartoon Heroes Agents', icon: '🎨' },
    { id: 'superhero', name: 'Superhero Agents', icon: '🦸‍♂️' },
    { id: 'netflixShows', name: 'Netflix TV Show Agents', icon: '📺' },
];


export const agents: Agent[] = [
    // Demo agents from main folder
    {
        id: 'twitter-demo',
        name: 'Twitter Agent Demo',
        description: 'Agent created from Twitter profile with AI-driven personality',
        category: 'Social',
        chains: ['ETH', 'BASE'],
        version: '1.0.0',
        score: 4.9,
        imageUrl: '/logos/twitter.png',
        contractAddress: '0xdemo1',
        twitter: '@twitteragent',
        stats: {
            users: 5000,
            transactions: 50000,
            volume: 1000000,
        },
        features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
    },
    {
        id: 'character-demo',
        name: 'Custom Character Demo',
        description: 'Agent created from character profile with unique personality traits',
        category: 'Social',
        chains: ['ETH', 'Polygon'],
        version: '1.0.0',
        score: 4.7,
        imageUrl: '/logos/custom-bot.jpg',
        contractAddress: '0xdemo2',
        stats: {
            users: 3500,
            transactions: 30000,
            volume: 750000,
        },
        features: ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
    },
    // Twitter-based demo agents
    {
        id: 'twitter-elonmusk',
        name: 'Elon Musk',
        description: 'Tech entrepreneur and visionary with interests in space exploration, electric vehicles, and AI',
        category: 'Social',
        chains: ['ETH', 'BASE', 'Solana'],
        version: '1.0.0',
        score: 4.8,
        imageUrl: '/avatars/1.png',
        contractAddress: '0xelon1',
        twitter: '@elonmusk',
        stats: {
            users: 12500,
            transactions: 85000,
            volume: 3500000,
        },
        features: ['Twitter Analysis', 'Personality Mirroring', 'Tech Insights'],
    },
    {
        id: 'twitter-vitalik',
        name: 'Vitalik Buterin',
        description: 'Ethereum co-founder and blockchain visionary focused on decentralized technology',
        category: 'Social',
        chains: ['ETH', 'Optimism', 'Arbitrum'],
        version: '1.0.0',
        score: 4.9,
        imageUrl: '/avatars/2.png',
        contractAddress: '0xvitalik1',
        twitter: '@vitalikbuterin',
        stats: {
            users: 9800,
            transactions: 76000,
            volume: 4200000,
        },
        features: ['Blockchain Analysis', 'Ethereum Expertise', 'Technical Insights'],
    },
    // Character-based demo agents
    {
        id: 'character-sherlock',
        name: 'Sherlock Holmes',
        description: 'Brilliant detective with exceptional analytical skills and attention to detail',
        category: 'Social',
        chains: ['ETH', 'Polygon'],
        version: '1.0.0',
        score: 4.6,
        imageUrl: '/avatars/3.png',
        contractAddress: '0xsherlock1',
        stats: {
            users: 7200,
            transactions: 45000,
            volume: 1800000,
        },
        features: ['Analytical Reasoning', 'Problem Solving', 'Deductive Logic'],
    },
    {
        id: 'character-ironman',
        name: 'Tony Stark',
        description: 'Genius inventor, billionaire, and superhero with expertise in advanced technology',
        category: 'Social',
        chains: ['ETH', 'Avalanche', 'Solana'],
        version: '1.0.0',
        score: 4.7,
        imageUrl: '/avatars/4.png',
        contractAddress: '0xstark1',
        stats: {
            users: 8500,
            transactions: 62000,
            volume: 2900000,
        },
        features: ['Tech Innovation', 'Strategic Planning', 'Witty Responses'],
    },
    // Trading agents
    {
        id: 'trading-master',
        name: 'TradeMaster Pro',
        description: 'Advanced trading bot with ML-powered market analysis',
        category: 'Trading',
        chains: ['ETH', 'BASE', 'MATIC'],
        version: '2.1.0',
        score: 4.8,
        imageUrl: '/avatars/5.png',
        contractAddress: '0x123...',
        stats: {
            users: 15000,
            transactions: 1200000,
            volume: 25000000,
        },
        features: ['Market Analysis', 'Automated Trading', 'Risk Management'],
    },
    {
        id: 'trading-crypto',
        name: 'CryptoTrader AI',
        description: 'Specialized in cryptocurrency trading with real-time market insights',
        category: 'Trading',
        chains: ['ETH', 'Solana', 'Avalanche'],
        version: '1.8.0',
        score: 4.5,
        imageUrl: '/avatars/6.png',
        contractAddress: '0xcrypto1',
        stats: {
            users: 11000,
            transactions: 950000,
            volume: 18000000,
        },
        features: ['Crypto Analysis', 'Trend Detection', 'Portfolio Management'],
    },
    // Social agents
    {
        id: 'social-master',
        name: 'SocialMaster',
        description: 'Social media management agent with AI-driven content creation',
        category: 'Social',
        chains: ['ETH', 'BSC', 'Polygon'],
        version: '1.5.3',
        score: 4.5,
        imageUrl: '/avatars/7.png',
        contractAddress: '0x456...',
        stats: {
            users: 10000,
            transactions: 800000,
            volume: 10000000,
        },
        features: ['Content Creation', 'Audience Engagement', 'Trend Analysis'],
    },
    // Political leader agents
    {
        id: 'political-lincoln',
        name: 'Abraham Lincoln',
        description: 'Visionary leader known for wisdom, integrity, and unifying leadership style',
        category: 'Social',
        chains: ['ETH', 'BASE'],
        version: '1.0.0',
        score: 4.9,
        imageUrl: '/avatars/8.png',
        contractAddress: '0xlincoln1',
        stats: {
            users: 6800,
            transactions: 42000,
            volume: 1600000,
        },
        features: ['Leadership Insights', 'Historical Context', 'Ethical Guidance'],
    },
];

// opensea NFT collection URL:
export const OPENSEA_NFT_COLLECTION_URL =
    "https://testnets.opensea.io/collection/smolsmolnftscollectionteessst-1";

// * deployer wallet address:
export const DEPLOYER_WALLET_ADDRESS =
    "0x6154CCc7ef29D01A30AA8f51afAB635Ae32d581b";

// * ERC20 token contract address:
export const ERC20_TOKEN_CONTRACT_ADDRESS =
    "0xd88E46AfC2C43A584DFb0836B098778dc0dF2e7F";

// * NFT contract address:
export const NFT_CONTRACT_ADDRESS =
    "0xf8a34aC797A4982631D1d54E6B70ae4feeC14230";

// * profile generation:
export const LIFE_GOALS_DEFAULT_COUNT = 6;

// * twitter api:
export const MAX_PUBLICATIONS_WHEN_PARSING_PROFILE = 92;
export const MAX_TWEET_API_CALL_COUNT = 2;

// * AI models:
export const GEMINI_LATEST = "gemini-2.0-flash-exp";
export const GEMINI_THINKING = "gemini-2.0-flash-thinking-exp";

// discord webhooks:
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL as string;
export const DISCORD_WEBHOOK_ERRORS_URL = process.env
    .DISCORD_WEBHOOK_ERRORS_URL as string;

export const IS_LOCALHOST = process.env.NODE_ENV === "development";

export const PAGE_SIZE = 30;

export const BASESCAN_URL = "https://sepolia.basescan.org";
export const OPENSEA_URL = "https://testnets.opensea.io";


// const agent = {
//   id: agentId,
//   name: 'TradeMaster Pro',
//   description: 'Advanced trading bot with ML-powered market analysis and real-time market insights. Leverages cutting-edge artificial intelligence to maximize trading opportunities across multiple chains.',
//   category: 'Trading',
//   chains: ['ETH', 'BSC', 'Polygon', 'Arbitrum'],
//   version: '2.1.0',
//   score: 4.8,
//   imageUrl: '/agents/trading-bot.png',
//   contractAddress: '0x123...',
//   stats: {
//     users: 15000,
//     transactions: 1200000,
//     volume: 25000000,
//   },
//   features: [
//     'Real-time market analysis',
//     'Multi-chain support',
//     'Advanced ML algorithms',
//     'Automated trading strategies',
//     'Risk management system',
//     'Performance analytics',
//   ],
//   metrics: [
//     {
//       label: 'Total Volume',
//       value: '$25M',
//       change: 12.5,
//       timeframe: 'vs. last month',
//     },
//     {
//       label: 'Active Users',
//       value: '15,000',
//       change: 8.2,
//       timeframe: 'vs. last month',
//     },
//     {
//       label: 'Success Rate',
//       value: '94.5%',
//       change: 2.1,
//       timeframe: 'vs. last month',
//     },
//     {
//       label: 'Avg. ROI',
//       value: '18.2%',
//       change: 5.4,
//       timeframe: 'vs. last month',
//     },
//   ],
//   reviews: [
//     {
//       id: '1',
//       user: {
//         name: 'Alex Thompson',
//         avatar: '/users/alex.jpg',
//         role: 'Crypto Trader',
//       },
//       rating: 5,
//       comment: 'This AI agent has completely transformed my trading strategy. The ML-powered analysis is incredibly accurate.',
//       date: '2024-02-28',
//     },
//     {
//       id: '2',
//       user: {
//         name: 'Sarah Chen',
//         avatar: '/users/sarah.jpg',
//         role: 'DeFi Developer',
//       },
//       rating: 4,
//       comment: 'Impressive performance across multiple chains. The risk management features are particularly well implemented.',
//       date: '2024-02-25',
//     },
//     // Add more reviews
//   ],
// };
