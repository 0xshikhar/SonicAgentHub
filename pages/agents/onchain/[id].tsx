import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Agent } from '@/lib/types'
import { AuthCheck } from '@/components/AuthCheck'
import LoadingState from '@/components/LoadingState'
import { getWalletByHandle } from '@/lib/supabase-db'
import { getBalanceByHandleNoCache } from '@/lib/web3functions'

// Extended interface for onchain agents with additional properties
interface OnchainAgent extends Agent {
    handle: string;
    bio: string;
    life_goals: string;
    skills: string;
    life_context: string;
    walletAddress?: string;
    tokenBalance?: string;
    weeklyIncome?: number;
    weeklyExpenses?: number;
}

// Interface for parsed life context
interface ParsedLifeContext {
    one_liner?: string;
    relationship_status_code?: string;
    city_name?: string;
    country_emoji?: string;
    current_job_title?: string;
    weekly_jobs_income?: number;
    weekly_jobs_income_explained?: string;
    weekly_life_expenses?: number;
    weekly_life_expenses_explained?: string;
}

// Messages interface for chat functionality
interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

export default function OnchainAgentDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const { isConnected } = useAccount()
    
    console.log('Router query:', router.query)
    console.log('Agent ID:', id)
    console.log('Wallet connected:', isConnected)
    
    const [agent, setAgent] = useState<OnchainAgent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [parsedLifeContext, setParsedLifeContext] = useState<ParsedLifeContext>({})
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        if (id && typeof id === 'string') {
            console.log('Fetching agent details for ID:', id)
            fetchAgentDetails()
        }
    }, [id])

    async function fetchAgentDetails() {
        try {
            setIsLoading(true)
            console.log('Starting fetchAgentDetails for ID:', id)
            
            // Create Supabase client
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            )
            
            console.log('Supabase client created with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
            
            // Fetch agent details from agent_chain_users table
            // Try to fetch by handle first (assuming id might be a handle)
            let { data: agentData, error } = await supabase
                .from('agent_chain_users')
                .select('*')
                .eq('handle', id)
                .single()
            
            console.log('Fetch by handle result:', { agentData, error })
            
            // If not found by handle, try to fetch by id
            if (error) {
                console.log('Agent not found by handle, trying by id')
                const { data: agentById, error: idError } = await supabase
                    .from('agent_chain_users')
                    .select('*')
                    .eq('id', id)
                    .single()
                
                console.log('Fetch by id result:', { agentById, idError })
                
                if (idError) {
                    console.error('Error fetching agent by id:', idError)
                    setIsLoading(false)
                    return
                }
                
                agentData = agentById
            }
            
            if (!agentData) {
                console.error('Agent not found')
                setIsLoading(false)
                return
            }
            
            console.log('Agent data found:', agentData)
            
            // Fetch wallet information
            const walletData = await getWalletByHandle(agentData.handle)
            console.log('Wallet data:', walletData)

            // Fetch token balance if wallet exists
            let tokenBalance = '0'
            if (walletData?.address) {
                try {
                    console.log('Fetching balance for wallet address:', walletData.address)
                    const balance = await getBalanceByHandleNoCache(agentData.handle)
                    console.log('Balance result:', balance)
                    tokenBalance = balance ? ethers.utils.formatEther(balance) : '0'
                    console.log('Formatted token balance:', tokenBalance)
                } catch (error) {
                    console.error('Error fetching balance:', error)
                    // Continue with zero balance
                    tokenBalance = '0'
                }
            } else {
                console.log('No wallet address found, using zero balance')
            }

            // Parse life context JSON if available
            let parsedContext: ParsedLifeContext = {}
            if (agentData.life_context) {
                try {
                    parsedContext = JSON.parse(agentData.life_context)
                } catch (e) {
                    console.error('Error parsing life context:', e)
                }
            }

            setParsedLifeContext(parsedContext)

            // Create agent object with all required properties
            const onchainAgent: OnchainAgent = {
                id: agentData.handle,
                handle: agentData.handle,
                name: agentData.display_name,
                description: agentData.bio,
                category: 'Social', // Default category
                version: '1.0',
                score: 4.5, // Default score
                imageUrl: agentData.profile_picture,
                bio: agentData.bio,
                life_goals: agentData.life_goals,
                skills: agentData.skills,
                life_context: agentData.life_context,
                walletAddress: walletData?.address,
                tokenBalance: tokenBalance,
                weeklyIncome: parsedContext.weekly_jobs_income,
                weeklyExpenses: parsedContext.weekly_life_expenses,
                twitter: agentData.handle,
                stats: {
                    users: 0,
                    transactions: 0,
                    volume: 0
                }
            }

            setAgent(onchainAgent)

            // Add initial system message
            setMessages([
                {
                    id: '1',
                    role: 'system',
                    content: `Hello! I'm ${agentData.display_name}, an onchain agent. How can I help you today?`,
                    timestamp: new Date()
                }
            ])

        } catch (error) {
            console.error('Error in fetchAgentDetails:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !agent) return

        try {
            setIsSending(true)

            // Add user message
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: inputMessage,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, userMessage])
            setInputMessage('')

            // Simulate agent response (in a real app, this would call an API)
            setTimeout(() => {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `As an onchain agent, I'm still learning to respond. My wallet address is ${agent.walletAddress || 'not available yet'}.`,
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, assistantMessage])
                setIsSending(false)
            }, 1500)

        } catch (error) {
            console.error('Error sending message:', error)
            setIsSending(false)
        }
    }

    // Parse skills from JSON string
    const parseSkills = (skillsJson: string) => {
        try {
            const skills = JSON.parse(skillsJson)
            return skills
        } catch (e) {
            console.error('Error parsing skills:', e)
            return []
        }
    }

    // Parse life goals from string
    const parseLifeGoals = (goalsString: string) => {
        if (!goalsString) return []
        return goalsString.split('\n').filter(goal => goal.trim() !== '')
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
                <p className="text-gray-400 mb-8">The onchain agent you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push('/agents')}>
                    Back to Agents
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0E1A]">
            {isConnected ? (
                <AuthCheck>
                    {/* Agent Profile Header with Cosmic Theme */}
                    <div className="relative">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent"></div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Agent Avatar and Stats */}
                                <div className="flex flex-col items-center md:items-start">
                                    {/* Avatar with Glow Effect */}
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 blur-md group-hover:opacity-100 transition duration-300"></div>
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10">
                                            {agent.imageUrl ? (
                                                <Image
                                                    src={agent.imageUrl}
                                                    alt={agent.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Onchain Badge */}
                                    <div className="mt-4">
                                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full">
                                            Onchain Agent
                                        </Badge>
                                    </div>

                                    {/* Wallet Badge */}
                                    {agent.walletAddress && (
                                        <div className="mt-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-xs font-mono text-gray-300">
                                            {`${agent.walletAddress.substring(0, 6)}...${agent.walletAddress.substring(agent.walletAddress.length - 4)}`}
                                        </div>
                                    )}

                                    {/* Token Balance */}
                                    {agent.tokenBalance && (
                                        <div className="mt-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-sm font-medium text-white">
                                            {parseFloat(agent.tokenBalance).toFixed(4)} ETH
                                        </div>
                                    )}
                                </div>

                                {/* Agent Info */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
                                    <p className="text-gray-400 mb-4">@{agent.handle}</p>

                                    {/* Agent Bio */}
                                    <p className="text-gray-300 mb-6">{agent.bio}</p>

                                    {/* Agent Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm">Balance</p>
                                            <p className="text-white text-xl font-bold">{parseFloat(agent.tokenBalance || '0').toFixed(4)} ETH</p>
                                        </div>

                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm">Weekly Income</p>
                                            <p className="text-white text-xl font-bold">${agent.weeklyIncome || 0}</p>
                                        </div>

                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm">Weekly Expenses</p>
                                            <p className="text-white text-xl font-bold">${agent.weeklyExpenses || 0}</p>
                                        </div>

                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm">Net Flow</p>
                                            <p className={`text-xl font-bold ${(agent.weeklyIncome || 0) - (agent.weeklyExpenses || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                ${((agent.weeklyIncome || 0) - (agent.weeklyExpenses || 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="mt-8">
                                <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-md border border-white/5 rounded-xl">
                                        <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                            Profile
                                        </TabsTrigger>
                                        <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                            Chat
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Profile Tab Content */}
                                    <TabsContent value="profile" className="mt-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Life Context Section */}
                                            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                                <h2 className="text-xl font-bold text-white mb-4">Life Context</h2>
                                                <Separator className="mb-4 bg-white/10" />

                                                <div className="space-y-4">
                                                    {parsedLifeContext.one_liner && (
                                                        <div>
                                                            <p className="text-gray-400 text-sm">One Liner</p>
                                                            <p className="text-white">{parsedLifeContext.one_liner}</p>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {parsedLifeContext.relationship_status_code && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm">Relationship</p>
                                                                <p className="text-white">{parsedLifeContext.relationship_status_code}</p>
                                                            </div>
                                                        )}

                                                        {parsedLifeContext.current_job_title && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm">Occupation</p>
                                                                <p className="text-white">{parsedLifeContext.current_job_title}</p>
                                                            </div>
                                                        )}

                                                        {parsedLifeContext.city_name && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm">Location</p>
                                                                <p className="text-white">
                                                                    {parsedLifeContext.city_name}
                                                                    {parsedLifeContext.country_emoji && ` ${parsedLifeContext.country_emoji}`}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {parsedLifeContext.weekly_jobs_income_explained && (
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Income Source</p>
                                                            <p className="text-white">{parsedLifeContext.weekly_jobs_income_explained}</p>
                                                        </div>
                                                    )}

                                                    {parsedLifeContext.weekly_life_expenses_explained && (
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Expenses</p>
                                                            <p className="text-white">{parsedLifeContext.weekly_life_expenses_explained}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Life Goals Section */}
                                            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                                <h2 className="text-xl font-bold text-white mb-4">Life Goals</h2>
                                                <Separator className="mb-4 bg-white/10" />

                                                <ul className="space-y-3">
                                                    {parseLifeGoals(agent.life_goals).map((goal, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs mr-3 mt-0.5">
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-gray-300">{goal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Skills Section */}
                                            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6 lg:col-span-2">
                                                <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                                                <Separator className="mb-4 bg-white/10" />

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {parseSkills(agent.skills).map((skill: any, index: number) => (
                                                        <div key={index} className="bg-black/30 backdrop-blur-md border border-white/5 rounded-lg p-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h3 className="text-white font-medium">{skill.name}</h3>
                                                                <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                                                    Lv. {skill.level}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-400 text-sm">{skill.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Chat Tab Content */}
                                    <TabsContent value="chat" className="mt-6">
                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6 h-[600px] flex flex-col">
                                            {/* Messages Container */}
                                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                                                {messages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                                    : 'bg-gray-800 text-gray-200'
                                                                }`}
                                                        >
                                                            {message.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Input Area */}
                                            <div className="flex gap-2">
                                                <Textarea
                                                    value={inputMessage}
                                                    onChange={(e) => setInputMessage(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="resize-none bg-black/30 border-white/10 focus:border-blue-500"
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
                                                    {isSending ? 'Thinking...' : 'Send'}
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </AuthCheck>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <h1 className="text-2xl font-bold text-white mb-4">Wallet Connection Required</h1>
                    <p className="text-gray-400 mb-8">Please connect your wallet to view this onchain agent.</p>
                    <Button onClick={() => router.push('/agents')}>
                        Back to Agents
                    </Button>
                </div>
            )}
        </div>
    )
} 