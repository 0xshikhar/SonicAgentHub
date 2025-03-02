import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { categories, agents as staticAgents } from '@/lib/constants';
import LoadingState from '@/components/LoadingState'; 
import axios from 'axios';
import { Agent } from '@/lib/types';
import { showToast } from '@/lib/toast';

// Extended Agent type with source information
interface ExtendedAgent extends Agent {
  agentType?: 'twitter' | 'character';
  source?: 'general_agents' | 'agent_chain_users' | 'local';
}

export default function AgentsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<ExtendedAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agents from API
  useEffect(() => {
    async function fetchAgents() {
      try {
        setIsLoading(true);
        // Get the current origin to ensure we're using the correct URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        console.log(`Using base URL: ${baseUrl} for agents list API request`);
        
        const response = await axios.post(`${baseUrl}/api/agent-training`, {
          action: 'getGeneralAgents'
        });
        
        if (response.data.success) {
          // Combine static agents with API agents
          const apiAgents = response.data.data;
          
          // Mark static agents as local
          const markedStaticAgents = staticAgents.map(agent => ({
            ...agent,
            source: 'local'
          }));
          
          setAgents([...markedStaticAgents, ...apiAgents]);
        } else {
          throw new Error(response.data.error || 'Failed to fetch agents');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        showToast.error('Failed to load agents from API, using static agents instead');
        // Fallback to static agents
        setAgents(staticAgents.map(agent => ({
          ...agent,
          source: 'local'
        })));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    // Filter by category
    let matchesCategory = selectedCategory === 'all';
    
    if (selectedCategory === 'twitter') {
      matchesCategory = agent.agentType === 'twitter' || agent.twitter !== undefined;
    } else if (selectedCategory === 'character') {
      matchesCategory = agent.agentType === 'character' && !agent.twitter;
    } else if (selectedCategory !== 'all') {
      matchesCategory = agent.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    
    // Filter by search query
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Helper function to determine agent badge type
  const getAgentBadge = (agent: ExtendedAgent) => {
    if (agent.source === 'local') {
      return {
        text: 'Primary',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-400'
      };
    } else if (agent.source === 'agent_chain_users') {
      return {
        text: 'Onchain',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-400'
      };
    } else if (agent.agentType === 'twitter') {
      return {
        text: 'Twitter',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-400'
      };
    } else {
      return {
        text: 'Character',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-400'
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header with search and filters */}
      <div className="relative border-b border-white/5">
        {/* Cosmic Background with Stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {/* Simulated stars using pseudo-elements in the background */}
            <div className="absolute h-1 w-1 rounded-full bg-white top-[10%] left-[15%] animate-pulse"></div>
            <div className="absolute h-1 w-1 rounded-full bg-white top-[25%] left-[40%] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute h-1 w-1 rounded-full bg-white top-[15%] left-[65%] animate-pulse" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute h-1 w-1 rounded-full bg-white top-[45%] left-[85%] animate-pulse" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute h-1 w-1 rounded-full bg-white top-[65%] left-[25%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute h-2 w-2 rounded-full bg-blue-400 top-[30%] left-[75%] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute h-2 w-2 rounded-full bg-purple-400 top-[70%] left-[60%] animate-pulse" style={{ animationDelay: '1.8s' }}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                Discover AI Agents
              </h1>
              
              <p className="text-gray-300 text-lg mb-8 max-w-2xl">
                Explore our collection of AI agents powered by advanced machine learning. 
                Chat, trade, and collaborate with specialized digital entities.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/agents/create')}
              className="relative group self-start"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center space-x-2 bg-[#131B31] text-white px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Create Agent</span>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-10 mt-8 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <svg
              className="absolute left-4 top-4 h-6 w-6 text-gray-400"
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
          <div className="flex space-x-4 mb-8 pb-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#131B31] text-gray-400 hover:text-white hover:bg-[#1a2234] hover:shadow-md hover:shadow-blue-500/10'
                }`}
              >
                {category.icon && <span className="mr-2 text-lg">{category.icon}</span>}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingState />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-medium text-white mb-4">No agents found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Try adjusting your search or filter criteria, or create a new agent to expand our ecosystem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => {
              const badge = getAgentBadge(agent);
              
              return (
                <div
                  key={agent.id}
                  className="group relative bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] rounded-2xl overflow-hidden cursor-pointer backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:translate-y-[-4px]"
                  onClick={() => router.push(`/agents/${agent.id}`)}
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated Corner Accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500 to-purple-600 rotate-45 transform origin-top-right group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Source Badge - Moved to top right */}
                  <div className="absolute top-14 right-4 px-2.5 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md border border-white/10 z-10">
                    <span className={`flex items-center ${badge.textColor}`}>
                      <span className={`w-1.5 h-1.5 ${badge.bgColor} rounded-full mr-1.5`}></span>
                      {badge.text}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start mb-6">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden mr-4 border-2 border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-lg">
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
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{agent.name}</h3>
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

                    {/* Description */}
                    <div className="text-gray-300 text-sm mb-6 line-clamp-3 group-hover:text-gray-200 transition-colors duration-300 min-h-[4.5rem]">
                      {agent.description}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1.5 text-sm bg-[#131B31] text-blue-400 rounded-lg border border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                          {agent.category}
                        </span>
                      </div>
                      
                      {/* Chat Button */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 