import { Agent } from './types';

// opensea does not suppore aurora testnet & agent chain 
export const OPENSEA_NFT_COLLECTION_URL =
    "https://testnets.opensea.io/collection/0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5";

// * deployer wallet address:
export const DEPLOYER_WALLET_ADDRESS =
    "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5";

// * AGENT token contract address on aurora testnet:
export const ERC20_TOKEN_CONTRACT_ADDRESS =
    "0x419cFe85e77a0A26B9989059057318F59764F7C5";

// * NFT contract address:
export const NFT_CONTRACT_ADDRESS =
    "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5";

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


export const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'twitter', name: 'Twitter Agents', icon: '🐦' },
    { id: 'character', name: 'Character Agents', icon: '🎭' },
    { id: 'trading', name: 'Trading Agents', icon: '📈' },
    { id: 'social', name: 'Social Agents', icon: '💬' },
    { id: 'politicalLeader', name: 'Political Leader Agents', icon: '🗳️' },
    { id: 'cryptoFounder', name: 'Crypto Founder Agents', icon: '👨‍💻' },
    { id: 'cartoonHeroes', name: 'Cartoon Heroes Agents', icon: '🎨' },
    { id: 'superhero', name: 'Superhero Agents', icon: '🦸‍♂️' },
];


export const agents: Agent[] = [
    // Demo agents from main folder
    // {
    //     id: 'twitter-demo',
    //     name: 'Twitter Agent Demo',
    //     description: 'Agent created from Twitter profile with AI-driven personality',
    //     category: 'Social',
    //     version: '1.0.0',
    //     score: 4.9,
    //     imageUrl: '/logos/twitter.png',
    //     twitter: '@twitteragent',
    //     features: ['Twitter Analysis', 'Personality Mirroring', 'Content Generation'],
    // },
    // {
    //     id: 'character-demo',
    //     name: 'Custom Character Demo',
    //     description: 'Agent created from character profile with unique personality traits',
    //     category: 'Social',
    //     version: '1.0.0',
    //     score: 4.7,
    //     imageUrl: '/logos/custom-bot.jpg',
    //     features: ['Custom Personality', 'Role Playing', 'Interactive Conversations'],
    // },
    // {
    //     id: 'character-sherlock',
    //     name: 'Sherlock Holmes',
    //     description: 'Brilliant detective with exceptional analytical skills and attention to detail',
    //     category: 'Social',
    //     version: '1.0.0',
    //     score: 4.6,
    //     imageUrl: '',
    //     features: ['Analytical Reasoning', 'Problem Solving', 'Deductive Logic'],
    // },
    // {
    //     id: 'character-ironman',
    //     name: 'Tony Stark',
    //     description: 'Genius inventor, billionaire, and superhero with expertise in advanced technology',
    //     category: 'Social',
    //     version: '1.0.0',
    //     score: 4.7,
    //     imageUrl: '',
    //     features: ['Tech Innovation', 'Strategic Planning', 'Witty Responses'],
    // },
    // {
    //     id: 'political-lincoln',
    //     name: 'Abraham Lincoln',
    //     description: 'Visionary leader known for wisdom, integrity, and unifying leadership style',
    //     category: 'Social',
    //     version: '1.0.0',
    //     score: 4.9,
    //     imageUrl: '',
    //     features: ['Leadership Insights', 'Historical Context', 'Ethical Guidance'],
    // },
];
