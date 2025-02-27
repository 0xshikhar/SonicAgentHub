import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { agents, categories } from '@/lib/constants';
import LoadingState from '@/components/LoadingState'; 

export default function AgentsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
          <div className="flex space-x-4 mb-6 pb-2">
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
                      {agent.imageUrl ? (
                        <Image
                          src={agent.imageUrl}
                          alt={agent.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src="/logos/aiagent-bg.png"
                          alt="Placeholder"
                          fill
                          className="object-cover"
                        />
                      )}
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
                  {/* <div className="flex -space-x-2">
                    {agent.chains.map((chainId, index) => {
                      const chainData = chains.find((c) => c.id === chainId);
                      return (
                        <div
                          key={chainId}
                          className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#0D1425] bg-[#131B31] hover:scale-110 transition-transform duration-200"
                          style={{ 
                            zIndex: agent.chains.length - index,
                            transform: `translateX(${index * -8}px)` 
                          }}
                        >
                          {chainData && (
                            <Image
                              src={chainData.logo}
                              alt={chainData.name}
                              fill
                              className="object-contain p-1.5"
                              sizes="32px"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div> */}
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