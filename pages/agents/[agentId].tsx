"use client"
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { AgentMetric, Review } from '../../types';
import { agents, chains } from '../../lib/constant';
import LoadingState from '../../components/LoadingState';

export default function AgentDetailsPage() {
  const router = useRouter();
  const { agentId } = router.query;
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'analytics'>('overview');
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      // Find the agent from our data
      const foundAgent = agents.find(a => a.id === agentId);
      if (foundAgent) {
        // Enhance the agent data with additional fields
        setAgent({
          ...foundAgent,
          metrics: [
            {
              label: 'Total Volume',
              value: `$${(foundAgent.stats.volume / 1000000).toFixed(1)}M`,
              change: 12.5,
              timeframe: 'vs. last month',
            },
            {
              label: 'Active Users',
              value: foundAgent.stats.users.toLocaleString(),
              change: 8.2,
              timeframe: 'vs. last month',
            },
            {
              label: 'Total Transactions',
              value: (foundAgent.stats.transactions / 1000).toFixed(1) + 'K',
              change: 15.3,
              timeframe: 'vs. last month',
            },
            {
              label: 'Success Rate',
              value: '94.5%',
              change: 2.1,
              timeframe: 'vs. last month',
            },
          ],
          features: [
            'Real-time market analysis',
            'Multi-chain support',
            'Advanced ML algorithms',
            'Automated trading strategies',
            'Risk management system',
            'Performance analytics',
          ],
          reviews: [
            {
              id: '1',
              user: {
                name: 'Alex Thompson',
                avatar: '/users/alex.jpg',
                role: 'Crypto Trader',
              },
              rating: 5,
              comment: `This ${foundAgent.name} has completely transformed my strategy. The analysis is incredibly accurate.`,
              date: '2024-02-28',
            },
            {
              id: '2',
              user: {
                name: 'Sarah Chen',
                avatar: '/users/sarah.jpg',
                role: 'DeFi Developer',
              },
              rating: 4,
              comment: `Impressive performance across multiple chains. The ${foundAgent.category} features are particularly well implemented.`,
              date: '2024-02-25',
            },
          ],
        });
      } else {
        router.push('/404');
      }
      setLoading(false);
    }
  }, [agentId, router]);

  if (loading || !agent) {
    return <LoadingState />;
  }

  const MetricCard = ({ metric }: { metric: AgentMetric }) => (
    <div className="bg-[#0D1425] rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      <div className="relative">
        <h3 className="text-gray-400 text-sm mb-2">{metric.label}</h3>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-semibold text-white">{metric.value}</div>
          <div className={`flex items-center ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span className="text-sm font-medium">
              {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </span>
          </div>
        </div>
        <div className="text-gray-500 text-xs mt-2">{metric.timeframe}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Hero Section */}
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Agents
          </button>

          {/* Agent Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden mr-6">
                <Image
                  src={agent.imageUrl}
                  alt={agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="text-white font-medium">{agent.score}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">v{agent.version}</span>
                  <span className="text-gray-500">•</span>
                  <span className="px-3 py-1 text-sm bg-[#131B31] text-blue-400 rounded-lg">
                    {agent.category}
                  </span>
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
              Deploy Agent
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex space-x-8 mb-12">
          {['overview', 'reviews', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-lg font-medium capitalize ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              } pb-2 transition-colors`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Description */}
                <div className="bg-[#0D1425] rounded-2xl p-8">
                  <h2 className="text-xl font-medium text-white mb-4">About</h2>
                  <div className="text-gray-400 leading-relaxed">{agent.description}</div>
                </div>

                {/* Features */}
                <div className="bg-[#0D1425] rounded-2xl p-8">
                  <h2 className="text-xl font-medium text-white mb-6">Key Features</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {agent.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {agent.metrics.map((metric: AgentMetric, index: number) => (
                    <MetricCard key={index} metric={metric} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {agent.reviews.map((review: Review) => ( 
                  <div key={review.id} className="bg-[#0D1425] rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                          <Image
                            src={review.user.avatar}
                            alt={review.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{review.user.name}</h3>
                          <div className="text-gray-400 text-sm">{review.user.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-300 leading-relaxed">{review.comment}</div>
                    <div className="text-gray-500 text-sm mt-4">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-[#0D1425] rounded-2xl p-8">
                <h2 className="text-xl font-medium text-white mb-6">Performance Analytics</h2>
                {/* Add charts and analytics here */}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Chain Support */}
            <div className="bg-[#0D1425] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Supported Chains</h2>
              <div className="flex flex-wrap gap-3">
                {agent.chains.map((chainId: string) => {
                  const chainData = chains.find(c => c.id === chainId);
                  return (
                    <div
                      key={chainId}
                      className="flex items-center px-3 py-2 bg-[#131B31] rounded-lg"
                    >
                      {chainData && (
                        <Image
                          src={chainData.logo}
                          alt={chainData.name}
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                      )}
                      <span className="text-gray-300">{chainData?.name || chainId}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-[#0D1425] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Contract Details</h2>
              <div className="flex items-center justify-between bg-[#131B31] rounded-lg px-4 py-3">
                <span className="text-gray-400 text-sm font-mono">{agent.contractAddress}</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#0D1425] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-medium">{agent.stats.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transactions</span>
                  <span className="text-white font-medium">{agent.stats.transactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume</span>
                  <span className="text-white font-medium">${(agent.stats.volume / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add getStaticPaths to pre-render agent pages
export async function getStaticPaths() {
  const paths = agents.map((agent) => ({
    params: { agentId: agent.id },
  }));

  return {
    paths,
    fallback: false,
  };
}

// Add getStaticProps to fetch agent data at build time
export async function getStaticProps({ params }: { params: { agentId: string } }) {
  const agent = agents.find((a) => a.id === params.agentId);

  if (!agent) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      agent,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
} 