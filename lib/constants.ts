import { Agent } from './types';

export const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'twitter', name: 'Twitter Agents', icon: '🐦' },
    { id: 'politicalLeader', name: 'Political Leader Agents', icon: '🗳️' },
    { id: 'blockchainFounder', name: 'Blockchain Founder Agents', icon: '👨‍💻' },
    { id: 'cartoonHeroes', name: 'Cartoon Heroes Agents', icon: '🎨' },
    { id: 'superhero', name: 'Superhero Agents', icon: '🦸‍♂️' },
    { id: 'netflixShows', name: 'Netflix TV Show Agents', icon: '📺' },
];


export const agents: Agent[] = [
    {
        id: '1',
        name: 'TradeMaster Pro',
        description: 'Advanced trading bot with ML-powered market analysis',
        category: 'Trading',
        chains: ['ETH', 'BASE', 'MATIC'],
        version: '2.1.0',
        score: 4.8,
        imageUrl: '',
        contractAddress: '0x123...',
        stats: {
            users: 15000,
            transactions: 1200000,
            volume: 25000000,
        },
    },
    {
        id: '2',
        name: 'SocialMaster',
        description: 'Social media management agent with AI-driven content creation',
        category: 'Social',
        chains: ['ETH', 'BSC', 'Polygon'],
        version: '1.5.3',
        score: 4.5,
        imageUrl: '',
        contractAddress: '0x456...',
        stats: {
            users: 10000,
            transactions: 800000,
            volume: 10000000,
        },
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
