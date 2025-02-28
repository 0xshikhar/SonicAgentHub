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

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

export default function AgentDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const [agent, setAgent] = useState<Agent | null>(null)
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
                const response = await axios.post('/api/agent-training', {
                    action: 'getAgent',
                    agentId: id
                })

                if (response.data.success) {
                    setAgent(response.data.data)
                    // Add system welcome message
                    setMessages([
                        {
                            id: 'welcome',
                            role: 'assistant',
                            content: `Hi there! I'm ${response.data.data.name}. How can I assist you today?`,
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
    }, [id])

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

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsSending(true)

        try {
            // Call API to get agent response
            const response = await axios.post('/api/agent-chat', {
                handle: agent.id,
                message: inputMessage
            })

            if (response.data.success) {
                const agentMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, agentMessage])
            } else {
                throw new Error(response.data.error || 'Failed to get response')
            }
        } catch (error) {
            console.error('Error getting agent response:', error)
            showToast.error('Failed to get response from agent')

            // Add a fallback error message from the agent
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsSending(false)
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

    return (
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
                                </div>
                            </div>

                            {/* Agent Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-xs">
                                <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                    <div className="text-sm text-gray-400">Users</div>
                                    <div className="text-white font-medium mt-1">
                                        {agent.stats.users.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                    <div className="text-sm text-gray-400">Txns</div>
                                    <div className="text-white font-medium mt-1">
                                        {agent.stats.transactions.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-[#131B31] rounded-xl p-3 text-center backdrop-blur-sm">
                                    <div className="text-sm text-gray-400">Volume</div>
                                    <div className="text-white font-medium mt-1">
                                        ${(agent.stats.volume / 1000000).toFixed(1)}M
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

                                    {/* Life Goals (inspired by the SMOL Universe image) */}
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
                                                        <LoadingState />
                                                        <span className="ml-2">Sending</span>
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
    )
} 