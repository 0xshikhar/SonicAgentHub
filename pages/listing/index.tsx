import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'Trading' | 'Social' | 'DeFi' | 'NFT' | 'Gaming' | 'DAO';
  chains: ('ETH' | 'BSC' | 'Solana' | 'Polygon' | 'Arbitrum')[];
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
}

export default function ListingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Trading', name: 'Trading Agents', icon: '📈' },
    { id: 'Social', name: 'Social Agents', icon: '🤝' },
    { id: 'DeFi', name: 'DeFi Agents', icon: '💰' },
    { id: 'NFT', name: 'NFT Agents', icon: '🎨' },
    { id: 'Gaming', name: 'Gaming Agents', icon: '🎮' },
    { id: 'DAO', name: 'DAO Agents', icon: '🏛️' },
  ];

  const chains = [
    { id: 'all', name: 'All Chains' },
    { id: 'ETH', name: 'Ethereum', icon: '/chains/eth.svg' },
    { id: 'BSC', name: 'BSC', icon: '/chains/bsc.svg' },
    { id: 'Solana', name: 'Solana', icon: '/chains/sol.svg' },
    { id: 'Polygon', name: 'Polygon', icon: '/chains/polygon.svg' },
    { id: 'Arbitrum', name: 'Arbitrum', icon: '/chains/arbitrum.svg' },
  ];

  // Sample agents data
  const agents: Agent[] = [
    {
      id: '1',
      name: 'TradeMaster Pro',
      description: 'Advanced trading bot with ML-powered market analysis',
      category: 'Trading',
      chains: ['ETH', 'BSC'],
      version: '2.1.0',
      score: 4.8,
      imageUrl: '/agents/trading-bot.png',
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
      chains: ['ETH', 'BSC', 'Solana'],
      version: '1.5.3',
      score: 4.5,
      imageUrl: '/agents/social-media-bot.png',
      contractAddress: '0x456...',
      stats: {
        users: 10000,
        transactions: 800000,
        volume: 10000000,
      },
    },
    {
      id: '3',
      name: 'DeFiTrader',
      description: 'Automated DeFi trading agent with smart contract analysis',
      category: 'DeFi',
      chains: ['ETH', 'BSC', 'Polygon', 'Arbitrum'],
      version: '1.2.0',
      score: 4.7,
      imageUrl: '/agents/defi-trading-bot.png',
      contractAddress: '0x789...',
      stats: {
        users: 8000,
        transactions: 6000000,
        volume: 50000000,
      },
    },
    {
      id: '4',
      name: 'NFTMarketAgent',
      description: 'Automated NFT trading agent with market analysis',
      category: 'NFT',
      chains: ['ETH', 'BSC', 'Polygon'],
      version: '1.1.0',
      score: 4.6,
      imageUrl: '/agents/nft-trading-bot.png',
      contractAddress: '0xabc...',
      stats: {
        users: 12000,
        transactions: 4000000,
        volume: 30000000,
      },
    },
    {
      id: '5',
      name: 'GamingMaster',
      description: 'AI-powered gaming agent with strategic gameplay',
      category: 'Gaming',
      chains: ['ETH', 'BSC', 'Solana'],
      version: '1.3.2',
      score: 4.9,
      imageUrl: '/agents/gaming-bot.png',
      contractAddress: '0xdef...',
      stats: {
        users: 15000,
        transactions: 10000000,
        volume: 200000000,
      },
    },
    {
      id: '6',
      name: 'DAOMaster',
      description: 'DAO management agent with governance and proposal creation',
      category: 'DAO',
      chains: ['ETH', 'BSC', 'Polygon'],
      version: '1.0.5',
      score: 4.8,
      imageUrl: '/agents/dao-bot.png',
      contractAddress: '0xghi...',
      stats: {
        users: 10000,
        transactions: 5000000,
        volume: 100000000,
      },
    },
    {
      id: '7',
      name: 'MarketMaster',
      description: 'Market analysis agent with real-time data and trading insights',
      category: 'Trading',
      chains: ['ETH', 'BSC', 'Polygon'],
      version: '1.2.3',
      score: 4.7,
      imageUrl: '/agents/market-bot.png',
      contractAddress: '0xjkl...',
      stats: {
        users: 10000,
        transactions: 5000000,
        volume: 100000000,
      },
    },
    {
      id: '8',
      name: 'SocialMaster',
      description: 'Social media management agent with AI-driven content creation',
      category: 'Social',
      chains: ['ETH', 'BSC', 'Solana'],
      version: '1.5.3',
      score: 4.5,
      imageUrl: '/agents/social-media-bot.png',
      contractAddress: '0x456...',
      stats: {
        users: 10000,
        transactions: 5000000,
        volume: 100000000,
      },
    },
    {
      id: '9',
      name: 'DeFiTrader',
      description: 'Automated DeFi trading agent with smart contract analysis',
      category: 'DeFi',
      chains: ['ETH', 'BSC', 'Polygon', 'Arbitrum'],
      version: '1.2.0',
      score: 4.7,
      imageUrl: '/agents/defi-trading-bot.png',
      contractAddress: '0x789...',
      stats: {
        users: 8000,
        transactions: 6000000,
        volume: 50000000,
      },
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesChain = selectedChain === 'all' || agent.chains.includes(selectedChain as any);
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesChain && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Header with search and filters */}
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            Discover AI Agents
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-8">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-5 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filters */}
          <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-[#131B31] text-gray-400 hover:text-white hover:bg-[#1a2234]'
                }`}
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
              </button>
            ))}
          </div>

          {/* Chain Filters */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedChain === chain.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-[#131B31] text-gray-400 hover:text-white hover:bg-[#1a2234]'
                }`}
              >
                {chain.icon && (
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                )}
                {chain.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group relative bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] rounded-2xl overflow-hidden cursor-pointer backdrop-blur-sm border border-white/[0.05]"
              onClick={() => router.push(`/agents/${agent.id}`)}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Card Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden mr-4">
                      <Image
                        src={agent.imageUrl}
                        alt={agent.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white">{agent.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-yellow-400">
                          <span className="text-sm mr-1">⭐</span>
                          <span className="text-sm font-medium">{agent.score}</span>
                        </div>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-sm text-gray-400">v{agent.version}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-gray-400 text-sm mb-6 line-clamp-2">
                  {agent.description}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0A1220] rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="text-sm text-gray-400">Users</div>
                    <div className="text-white font-medium mt-1">
                      {agent.stats.users.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#0A1220] rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="text-sm text-gray-400">Txns</div>
                    <div className="text-white font-medium mt-1">
                      {agent.stats.transactions.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#0A1220] rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="text-sm text-gray-400">Volume</div>
                    <div className="text-white font-medium mt-1">
                      ${(agent.stats.volume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {agent.chains.map((chain, index) => (
                      <div
                        key={chain}
                        className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#0D1425]"
                        style={{ zIndex: agent.chains.length - index }}
                      >
                        <Image
                          src={`/chains/${chain.toLowerCase()}.svg`}
                          alt={chain}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-sm bg-[#131B31] text-blue-400 rounded-lg">
                      {agent.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 