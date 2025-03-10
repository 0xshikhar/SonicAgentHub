import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import axios from 'axios'
import { Agent } from '@/lib/types'
import { showToast } from '@/lib/toast'
import LoadingState from '@/components/LoadingState'
import { ChatMessage } from '@/components/ChatMessage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { agents as staticAgents } from '@/lib/constants'
import { AuthCheck } from '@/components/AuthCheck'

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

// Extended Agent type with source information
interface ExtendedAgent extends Agent {
    agentType?: 'twitter' | 'character'
    source?: 'general_agents' | 'agent_chain_users' | 'local'
    stats?: {
        users?: number
        transactions?: number
        volume?: number
    }
    contractAddress?: string
    twitter?: string
    features?: string[]
    handle?: string
}

interface CustomError extends Error {
    details?: string // Optional details property
}

export default function AgentDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const [agent, setAgent] = useState<ExtendedAgent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'profile' | 'chat'>('profile')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch agent details
    useEffect(() => {
        if (!id) return

        async function fetchAgentDetails() {
            try {
                setIsLoading(true)
                
                if (!id) return;
                
                // Use the ID directly from the URL - this is the handle in our database
                const agentId = id as string;
                console.log(`Fetching agent details for handle: ${agentId}`);
                
                // First check if it's a static agent
                const staticAgent = staticAgents.find(a => a.id === agentId)

                if (staticAgent) {
                    // Mark as local source
                    setAgent({
                        ...staticAgent,
                        source: 'local'
                    })
                    
                    // Add system welcome message
                    setMessages([
                        {
                            id: 'welcome',
                            role: 'assistant',
                            content: `Hi there! I'm ${staticAgent.name}. How can I assist you today?`,
                            timestamp: new Date()
                        }
                    ])
                    setIsLoading(false)
                    return
                }
                
                // If not static, fetch from API
                // Get the current origin to ensure we're using the correct URL
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                console.log(`Using base URL: ${baseUrl} for API request`);
                
                const response = await axios.post(`${baseUrl}/api/agent-training`, {
                    action: 'getAgent',
                    agentId: agentId,
                    handle: agentId // Include handle as well to support lookup by handle
                });

                if (response.data.success) {
                    const agentData = response.data.data;
                    
                    // Only redirect to onchain agent page if it's from agent_chain_users table
                    // This ensures Twitter category agents from agent_chain_general_agents stay on this page
                    if (agentData.source === 'agent_chain_users') {
                        router.push(`/agents/onchain/${agentData.handle || id}`);
                        return;
                    }
                    
                    // Ensure we're using the correct handle from the URL
                    // This is critical for chat functionality
                    const enhancedAgentData = {
                        ...agentData,
                        // Use the URL ID as the primary identifier for the agent
                        // This ensures consistency between the URL and API requests
                        id: agentId
                    };
                    
                    console.log('Setting agent data with ID:', enhancedAgentData.id);
                    setAgent(enhancedAgentData);
                    
                    // Add system welcome message
                    setMessages([
                        {
                            id: 'welcome',
                            role: 'assistant',
                            content: `Hi there! I'm ${agentData.name}. How can I assist you today?`,
                            timestamp: new Date()
                        }
                    ])
                } else {
                    throw new Error(response.data.error || 'Failed to fetch agent details')
                }
            } catch (error) {
                console.error('Error fetching agent details:', error)
                showToast.error('Failed to load agent details')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAgentDetails()
    }, [id, router])

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !agent) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        }

        // Add user message to the chat
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsSending(true)

        // Add a temporary "thinking" message from the assistant
        const thinkingMessageId = `thinking-${Date.now()}`
        const thinkingMessage: Message = {
            id: thinkingMessageId,
            role: 'assistant',
            content: '...',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, thinkingMessage])

        try {
            // Get the current origin to ensure we're using the correct URL
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            console.log(`Using base URL: ${baseUrl} for chat API request`);
            
            // Use the agent ID directly - this is the handle in our database
            const agentHandle = agent.id;
            console.log(`Sending chat request for agent handle: ${agentHandle}`);
            console.log('Full agent data:', {
                id: agent.id,
                name: agent.name,
                agentType: agent.agentType,
                source: agent.source
            });
            
            // Call API to get agent response
            const response = await axios.post(`${baseUrl}/api/agent-chat`, {
                handle: agentHandle,
                message: inputMessage
            });

            if (response.data.success) {
                // Remove the thinking message and add the real response
                setMessages(prev => 
                    prev.filter(msg => msg.id !== thinkingMessageId).concat({
                        id: `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: response.data.message,
                        timestamp: new Date()
                    })
                )
            } else {
                throw new Error(response.data.error || 'Failed to get response')
            }
        } catch (error) {
            console.error('Error getting agent response:', error)
            
            // Extract detailed error message if available
            let errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
            
            if (error as any) {
                console.error('API error details:', error);
                console.log('API error details:', error);
                // errorMessage = `Error: ${error.message}`;
            }
            
            showToast.error('Failed to get response from agent');

            // Remove the thinking message and add an error message
            setMessages(prev => 
                prev.filter(msg => msg.id !== thinkingMessageId).concat({
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date()
                })
            )
        } finally {
            setIsSending(false)
        }
    }

    // Helper function to determine agent badge type
    const getAgentBadge = (agent: ExtendedAgent) => {
        if (agent.source === 'local') {
            return {
                text: 'Primary',
                textColor: 'text-emerald-400',
                bgColor: 'bg-emerald-400'
            }
        } else if (agent.source === 'agent_chain_users') {
            return {
                text: 'Onchain',
                textColor: 'text-blue-400',
                bgColor: 'bg-blue-400'
            }
        } else if (agent.agentType === 'twitter' || agent.twitter) {
            return {
                text: 'Twitter',
                textColor: 'text-purple-400',
                bgColor: 'bg-purple-400'
            }
        } else {
            return {
                text: 'Character',
                textColor: 'text-amber-400',
                bgColor: 'bg-amber-400'
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingState />
            </div>
        )
    }

    if (!agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
                <p className="text-gray-400 mb-8">The agent you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push('/agents')}>
                    Back to Agents
                </Button>
            </div>
        )
    }

    const badge = getAgentBadge(agent)

    return (
        <AuthCheck>
            <div className="min-h-screen bg-[#0A0E1A]">
                {/* Agent Profile Header */}
                <div className="relative">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Agent Avatar and Stats */}
                            <div className="flex flex-col items-center md:items-start">
                                {/* Avatar with Glow Effect */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10">
                                        <Image
                                            src={agent.imageUrl || '/logos/aiagent-bg.png'}
                                            alt={agent.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Source Badge */}
                                <div className="mt-4 px-3 py-1.5 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md border border-white/10">
                                    <span className={`flex items-center ${badge.textColor}`}>
                                        <span className={`w-1.5 h-1.5 ${badge.bgColor} rounded-full mr-1.5`}></span>
                                        {badge.text}
                                    </span>
                                </div>

                                {/* Agent Name and Score */}
                                <div className="mt-4 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                                    <div className="flex items-center mt-2 justify-center md:justify-start">
                                        <div className="flex items-center text-yellow-400">
                                            <span className="text-lg mr-1">⭐</span>
                                            <span className="text-lg font-medium">{agent.score}</span>
                                        </div>
                                        <span className="mx-2 text-gray-500">•</span>
                                        <span className="text-gray-400">v{agent.version}</span>
                                        {agent.twitter && (
                                            <>
                                                <span className="mx-2 text-gray-500">•</span>
                                                <a 
                                                    href={`https://twitter.com/${agent.twitter.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    {agent.twitter}
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Agent Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-xs">
                                    <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                        <div className="text-sm text-gray-400">Users</div>
                                        <div className="text-white font-medium mt-1">
                                            {agent.stats?.users?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                        <div className="text-sm text-gray-400">Txns</div>
                                        <div className="text-white font-medium mt-1">
                                            {agent.stats?.transactions?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                        <div className="text-sm text-gray-400">Volume</div>
                                        <div className="text-white font-medium mt-1">
                                            ${((agent.stats?.volume || 0) / 1000000).toFixed(1)}M
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Details */}
                            <div className="flex-1">
                                {/* Tabs */}
                                <div className="flex space-x-4 mb-6 border-b border-white/10 pb-2">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-4 py-2 font-medium transition-all duration-200 ${activeTab === 'profile'
                                                ? 'text-white border-b-2 border-blue-500'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className={`px-4 py-2 font-medium transition-all duration-200 ${activeTab === 'chat'
                                                ? 'text-white border-b-2 border-blue-500'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Chat
                                    </button>
                                </div>

                                {/* Profile Content */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        {/* Description */}
                                        <div>
                                            <h2 className="text-xl font-semibold text-white mb-2">About</h2>
                                            <p className="text-gray-300">{agent.description}</p>
                                        </div>

                                        {/* Skills */}
                                        <div>
                                            <h2 className="text-xl font-semibold text-white mb-3">Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {agent.features?.map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 bg-[#131B31] text-blue-400 rounded-lg text-sm"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                                {!agent.features?.length && (
                                                    <span className="text-gray-400">No skills listed</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Twitter Info (only for twitter-based agents) */}
                                        {(agent.agentType === 'twitter' || agent.twitter) && (
                                            <div>
                                                <h2 className="text-xl font-semibold text-white mb-3">Twitter Presence</h2>
                                                <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                    <div className="flex items-center mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                                        </svg>
                                                        <a 
                                                            href={`https://twitter.com/${agent.twitter?.replace('@', '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white font-medium hover:text-blue-400 transition-colors"
                                                        >
                                                            {agent.twitter}
                                                        </a>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">
                                                        This AI agent is trained on the Twitter profile, tweets, and interactions of {agent.name}. 
                                                        It aims to replicate their communication style, interests, and expertise.
                                                    </p>
                                                    <div className="mt-3 flex space-x-2">
                                                        <span className="px-2 py-1 bg-[#0D1425] text-purple-400 rounded-lg text-xs">AI Personality</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-purple-400 rounded-lg text-xs">Twitter Data</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-purple-400 rounded-lg text-xs">Interactive</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Character Info (only for character agents) */}
                                        {agent.agentType === 'character' && !agent.twitter && (
                                            <div>
                                                <h2 className="text-xl font-semibold text-white mb-3">Character Profile</h2>
                                                <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                    <h3 className="font-medium text-white mb-2">Custom AI Personality</h3>
                                                    <p className="text-gray-300 text-sm">
                                                        This is a custom character-based AI agent with a unique personality and backstory.
                                                        It has been designed to embody specific traits and characteristics.
                                                    </p>
                                                    <div className="mt-3 flex space-x-2">
                                                        <span className="px-2 py-1 bg-[#0D1425] text-amber-400 rounded-lg text-xs">Custom Character</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-amber-400 rounded-lg text-xs">Role Playing</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-amber-400 rounded-lg text-xs">Creative</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Onchain Info (only for onchain agents) */}
                                        {agent.source === 'agent_chain_users' && (
                                            <div>
                                                <h2 className="text-xl font-semibold text-white mb-3">Onchain Presence</h2>
                                                <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                    <div className="flex items-center mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                                        </svg>
                                                        <a 
                                                            href={`https://etherscan.io/address/${agent.contractAddress}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white font-medium hover:text-blue-400 transition-colors"
                                                        >
                                                            View on Etherscan
                                                        </a>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">
                                                        This is an onchain AI agent with its own wallet and ability to interact with blockchain protocols.
                                                        It can perform transactions, analyze on-chain data, and provide insights based on blockchain activity.
                                                    </p>
                                                    <div className="mt-3 flex space-x-2">
                                                        <span className="px-2 py-1 bg-[#0D1425] text-blue-400 rounded-lg text-xs">Onchain</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-blue-400 rounded-lg text-xs">Autonomous</span>
                                                        <span className="px-2 py-1 bg-[#0D1425] text-blue-400 rounded-lg text-xs">Web3 Native</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Life Goals (for local agents or if not specified) */}
                                        {(agent.source === 'local' || (!agent.agentType && !agent.twitter && agent.source !== 'agent_chain_users')) && (
                                            <div>
                                                <h2 className="text-xl font-semibold text-white mb-3">Life Goals</h2>
                                                <div className="space-y-4">
                                                    <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                        <h3 className="font-medium text-white mb-2">Resident Community Architect</h3>
                                                        <p className="text-gray-300 text-sm">
                                                            Establish and nurture a thriving Web3 and AI innovation hub, fostering a resilient tech community.
                                                        </p>
                                                    </div>

                                                    <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                        <h3 className="font-medium text-white mb-2">Ecosystem Connector</h3>
                                                        <p className="text-gray-300 text-sm">
                                                            Act as a bridge connecting the tech ecosystem with global networks, facilitating knowledge exchange and collaboration.
                                                        </p>
                                                    </div>

                                                    <div className="bg-[#131B31]/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                                        <h3 className="font-medium text-white mb-2">Agile Innovator</h3>
                                                        <p className="text-gray-300 text-sm">
                                                            Apply agile methodologies to rapidly develop and adapt the innovation hub to meet evolving needs.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Chat Content */}
                                {activeTab === 'chat' && (
                                    <div className="flex flex-col h-[600px]">
                                        {/* Messages Container */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0D1425] rounded-t-xl">
                                            {messages.map((message) => (
                                                <ChatMessage
                                                    key={message.id}
                                                    id={message.id}
                                                    role={message.role}
                                                    content={message.content}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className="p-4 bg-[#131B31] rounded-b-xl border-t border-white/5">
                                            <div className="flex items-end gap-2">
                                                <Textarea
                                                    value={inputMessage}
                                                    onChange={(e) => setInputMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="min-h-[60px] bg-[#0D1425] border-white/10 text-white resize-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendMessage()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={isSending || !inputMessage.trim()}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                >
                                                    {isSending ? (
                                                        <span className="flex items-center">
                                                            <LoadingState variant="inline" text="Thinking" />
                                                        </span>
                                                    ) : (
                                                        'Send'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthCheck>
    )
} 