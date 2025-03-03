import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Agent } from '@/lib/types'
import LoadingState from '@/components/LoadingState'
import { getWalletByHandle } from '@/lib/supabase-db'
import { getBalanceByHandleNoCache } from '@/lib/web3functions'
import { toast } from 'sonner'

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

// Add a Skill interface
interface Skill {
    emoji: string;
    name: string;
    level: number;
    description: string;
}

export default function OnchainAgentDetailPage() {
    console.log('Component rendering started')
    const router = useRouter()
    const { id } = router.query
    const { isConnected: wagmiIsConnected } = useAccount()
    
    // Force isConnected to true for testing
    const isConnected = true // wagmiIsConnected
    
    console.log('Router query full object:', JSON.stringify(router.query))
    console.log('Agent ID from query:', id)
    console.log('Is router ready:', router.isReady)
    console.log('Wallet connected:', isConnected)
    
    const [agent, setAgent] = useState<OnchainAgent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [parsedLifeContext, setParsedLifeContext] = useState<ParsedLifeContext>({})
    const [activeTab, setActiveTab] = useState('profile')
    const [isCopied, setIsCopied] = useState(false)

    // Add useRef for messages container
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    useEffect(() => {
        console.log('useEffect triggered, router.isReady:', router.isReady, 'id:', id, 'full query:', JSON.stringify(router.query))
        
        if (router.isReady && id && typeof id === 'string') {
            console.log('Fetching agent details for ID:', id)
            fetchAgentDetails()
        }
    }, [router.isReady, id])

    async function fetchAgentDetails() {
        try {
            setIsLoading(true)
            console.log('Starting fetchAgentDetails for ID:', id)
            console.log('ID type:', typeof id)
            
            if (!id) {
                console.error('ID is undefined or null, cannot fetch agent details')
                setIsLoading(false)
                return
            }
            
            // Create Supabase client
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            )
            
            console.log('Supabase client created with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
            console.log('Supabase anon key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
            
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
                    
                    // Fetch mock agent from API
                    console.log('Fetching mock agent from API for handle:', id)
                    try {
                        const response = await fetch(`/api/debug/mock-agent?handle=${id}`)
                        if (response.ok) {
                            const mockAgentData = await response.json()
                            console.log('Mock agent data:', mockAgentData)
                            
                            // Convert the mock agent data to the OnchainAgent format
                            const mockAgent: OnchainAgent = {
                                id: mockAgentData.id,
                                handle: mockAgentData.handle,
                                name: mockAgentData.name,
                                description: mockAgentData.description,
                                category: mockAgentData.category,
                                version: mockAgentData.version,
                                score: mockAgentData.score,
                                imageUrl: mockAgentData.imageUrl,
                                bio: mockAgentData.bio,
                                life_goals: mockAgentData.life_goals,
                                skills: JSON.stringify(mockAgentData.skills),
                                life_context: JSON.stringify(mockAgentData.life_context),
                                walletAddress: mockAgentData.walletAddress,
                                tokenBalance: mockAgentData.tokenBalance,
                                weeklyIncome: mockAgentData.weeklyIncome,
                                weeklyExpenses: mockAgentData.weeklyExpenses,
                                twitter: mockAgentData.twitter,
                                stats: mockAgentData.stats
                            }
                            
                            setAgent(mockAgent)
                            
                            // Set parsed life context
                            setParsedLifeContext(mockAgentData.life_context)
                            
                            // Add initial system message
                            setMessages([
                                {
                                    id: '1',
                                    role: 'assistant',
                                    content: `Hello! I'm ${mockAgent.name}, an onchain agent with my own wallet. I can help with questions about blockchain, crypto, or just chat about my interests. My wallet address is ${mockAgent.walletAddress ? `${mockAgent.walletAddress.substring(0, 6)}...${mockAgent.walletAddress.substring(mockAgent.walletAddress.length - 4)}` : 'being set up'}. How can I assist you today?`,
                                    timestamp: new Date()
                                }
                            ])
                            
                            setIsLoading(false)
                            return
                        } else {
                            console.error('Error fetching mock agent:', await response.text())
                        }
                    } catch (error) {
                        console.error('Error fetching mock agent:', error)
                    }
                    
                    // If mock agent API fails, use hardcoded mock agent
                    console.log('Creating mock agent for handle:', id)
                    const mockAgent: OnchainAgent = {
                        id: typeof id === 'string' ? id : 'testhandle789',
                        handle: typeof id === 'string' ? id : 'testhandle789',
                        name: `${typeof id === 'string' ? id.charAt(0).toUpperCase() + id.slice(1) : 'Testhandle789'}`,
                        description: `This is a mock profile for ${typeof id === 'string' ? id : 'testhandle789'}`,
                        category: 'Social',
                        version: '1.0',
                        score: 4.5,
                        imageUrl: `https://ui-avatars.com/api/?name=${typeof id === 'string' ? id : 'testhandle789'}&background=random&size=200`,
                        bio: `This is a mock profile for ${typeof id === 'string' ? id : 'testhandle789'}`,
                        life_goals: "* 🌐 **Decentralize the Web:** Create a more open and accessible internet through blockchain technology.\n* 🧩 **Solve Scalability:** Develop solutions that make blockchain technology viable for mainstream adoption.\n* 🔒 **Enhance Privacy:** Create systems that protect user data while maintaining transparency where needed.",
                        skills: '[{"emoji":"🧠","name":"Blockchain Development","level":95,"description":"Expert in Ethereum and smart contract development"},{"emoji":"💻","name":"Programming","level":90,"description":"Proficient in multiple programming languages"},{"emoji":"📊","name":"Cryptoeconomics","level":85,"description":"Deep understanding of token economics and incentive structures"}]',
                        life_context: '{"one_liner":"testhandle789 is a visionary in the blockchain space","relationship_status_code":"single","city_name":"Crypto City","country_emoji":"🌐","current_job_title":"Blockchain Developer","weekly_jobs_income":1000,"weekly_jobs_income_explained":"Income from blockchain development and consulting","weekly_life_expenses":500,"weekly_life_expenses_explained":"Living expenses in a tech hub"}',
                        walletAddress: '0x71F413D3b07D7FB5Ab58449988d76985f76842b9',
                        tokenBalance: '1500.00',
                        weeklyIncome: 1000,
                        weeklyExpenses: 500,
                        twitter: typeof id === 'string' ? id : 'testhandle789',
                        stats: {
                            users: 0,
                            transactions: 0,
                            volume: 0
                        }
                    }
                    
                    setAgent(mockAgent)
                    
                    // Parse life context
                    try {
                        const parsedContext = JSON.parse(mockAgent.life_context)
                        setParsedLifeContext(parsedContext)
                    } catch (e) {
                        console.error('Error parsing mock life context:', e)
                    }
                    
                    // Add initial system message
                    setMessages([
                        {
                            id: '1',
                            role: 'assistant',
                            content: `Hello! I'm ${mockAgent.name}, an onchain agent with my own wallet. I can help with questions about blockchain, crypto, or just chat about my interests. My wallet address is ${mockAgent.walletAddress ? `${mockAgent.walletAddress.substring(0, 6)}...${mockAgent.walletAddress.substring(mockAgent.walletAddress.length - 4)}` : 'being set up'}. How can I assist you today?`,
                            timestamp: new Date()
                        }
                    ])
                    
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
                    role: 'assistant',
                    content: `Hello! I'm ${agentData.display_name}, an onchain agent with my own wallet. I can help with questions about blockchain, crypto, or just chat about my interests. My wallet address is ${walletData?.address ? `${walletData.address.substring(0, 6)}...${walletData.address.substring(walletData.address.length - 4)}` : 'being set up'}. How can I assist you today?`,
                    timestamp: new Date()
                }
            ])

            setIsLoading(false)
        } catch (error) {
            console.error('Error in fetchAgentDetails:', error)
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

            // Add temporary thinking message
            const thinkingMessageId = (Date.now() + 1).toString()
            const thinkingMessage: Message = {
                id: thinkingMessageId,
                role: 'assistant',
                content: 'Thinking...',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, thinkingMessage])

            // Call the agent-chat API
            try {
                const response = await fetch('/api/agent-chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        handle: agent.handle,
                        message: inputMessage,
                    }),
                })

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    // Replace thinking message with actual response
                    setMessages(prev => 
                        prev.map(msg => 
                            msg.id === thinkingMessageId 
                                ? {
                                    ...msg,
                                    content: data.message,
                                  }
                                : msg
                        )
                    )
                } else {
                    throw new Error(data.error || 'Failed to get response from agent')
                }
            } catch (error) {
                console.error('Error getting agent response:', error)
                
                // Replace thinking message with error message
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === thinkingMessageId 
                            ? {
                                ...msg,
                                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                              }
                            : msg
                    )
                )
                
                toast.error('Failed to get response from agent')
            }

            setIsSending(false)
        } catch (error) {
            console.error('Error sending message:', error)
            setIsSending(false)
            toast.error('Error sending message')
        }
    }

    // Parse skills from JSON string
    const parseSkills = (skillsJson: string): Skill[] => {
        if (!skillsJson) return []
        try {
            return JSON.parse(skillsJson)
        } catch (error) {
            console.error('Error parsing skills:', error)
            return []
        }
    }

    // Parse life goals from string
    const parseLifeGoals = (goalsString: string) => {
        if (!goalsString) return []
        return goalsString.split('\n').filter(goal => goal.trim() !== '')
    }

    const handleShareAgent = () => {
        const url = `${window.location.origin}/agents/onchain/${agent?.handle}`
        navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success('Agent profile link copied to clipboard!')
        setTimeout(() => setIsCopied(false), 2000)
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
                                        {parseFloat(agent.tokenBalance).toFixed(4)} $AGENT
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
                                        <p className="text-white text-xl font-bold">{parseFloat(agent.tokenBalance || '0').toFixed(2)} $AGENT</p>
                                    </div>

                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                        <p className="text-gray-400 text-sm">Weekly Income</p>
                                        <p className="text-white text-xl font-bold">{agent.weeklyIncome || 0} $AGENT</p>
                                    </div>

                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                        <p className="text-gray-400 text-sm">Weekly Expenses</p>
                                        <p className="text-white text-xl font-bold">{agent.weeklyExpenses || 0} $AGENT</p>
                                    </div>

                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                        <p className="text-gray-400 text-sm">Net Flow</p>
                                        <p className={`text-xl font-bold ${(agent.weeklyIncome || 0) - (agent.weeklyExpenses || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ${((agent.weeklyIncome || 0) - (agent.weeklyExpenses || 0))}
                                        </p>
                                    </div>
                                </div>

                                {/* Share Agent Button */}
                                <Button 
                                    onClick={handleShareAgent}
                                    className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
                                >
                                    {isCopied ? 'Copied!' : 'Share Agent Profile'}
                                </Button>
                                
                                {/* Wallet Address with Scanner Link */}
                                {agent.walletAddress && (
                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-400 text-sm">Wallet Address</p>
                                            <a 
                                                href={`https://testnet.aurorascan.dev/address/${agent.walletAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                                            >
                                                View on Scanner
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                        <p className="text-white text-sm font-mono truncate">{agent.walletAddress}</p>
                                    </div>
                                )}
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
                                <TabsContent value="profile" className="space-y-6">
                                    {/* Life Goals Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Life Goals</h3>
                                        <Separator className="bg-white/10 mb-4" />
                                        <ul className="space-y-2">
                                            {parseLifeGoals(agent.life_goals).map((goal, index) => (
                                                <li key={index} className="text-gray-300">{goal}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Skills Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Skills</h3>
                                        <Separator className="bg-white/10 mb-4" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {parseSkills(agent.skills).map((skill: Skill, index: number) => (
                                                <div key={index} className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">{skill.emoji}</span>
                                                        <h4 className="text-white font-medium">{skill.name}</h4>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                            style={{ width: `${skill.level}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">{skill.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Transaction History Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Transaction History</h3>
                                        <Separator className="bg-white/10 mb-4" />
                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            {/* Mock transaction history */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                    <div>
                                                        <p className="text-white">Received $AGENT</p>
                                                        <p className="text-gray-400 text-xs">From: 0x3a...b4f2</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400">+500 $AGENT</p>
                                                        <p className="text-gray-400 text-xs">2 days ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                    <div>
                                                        <p className="text-white">Sent $AGENT</p>
                                                        <p className="text-gray-400 text-xs">To: 0x7c...e9a1</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-red-400">-200 $AGENT</p>
                                                        <p className="text-gray-400 text-xs">5 days ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-white">Initial Allocation</p>
                                                        <p className="text-gray-400 text-xs">From: Treasury</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400">+1000 $AGENT</p>
                                                        <p className="text-gray-400 text-xs">7 days ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center">
                                                <a 
                                                    href={`https://testnet.aurorascan.dev/address/${agent.walletAddress}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center"
                                                >
                                                    View all transactions
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Token Staking Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Token Staking</h3>
                                        <Separator className="bg-white/10 mb-4" />
                                        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-lg p-4">
                                                    <p className="text-gray-400 text-sm mb-1">Total Staked</p>
                                                    <p className="text-white text-xl font-bold">750 $AGENT</p>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                            style={{ width: '50%' }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-gray-400 text-xs mt-1">50% of total balance</p>
                                                </div>
                                                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-lg p-4">
                                                    <p className="text-gray-400 text-sm mb-1">Staking Rewards</p>
                                                    <p className="text-white text-xl font-bold">+45 $AGENT</p>
                                                    <p className="text-green-400 text-sm">+6% APY</p>
                                                    <p className="text-gray-400 text-xs mt-1">Last reward: 2 days ago</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                    disabled
                                                >
                                                    Stake More
                                                </Button>
                                                <Button 
                                                    className="flex-1 bg-black/50 hover:bg-black/70 border border-white/10"
                                                    disabled
                                                >
                                                    Unstake
                                                </Button>
                                            </div>
                                            <p className="text-gray-400 text-xs text-center mt-2">Staking functionality coming soon</p>
                                        </div>
                                    </div>

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
                                                        {message.content === 'Thinking...' ? (
                                                            <div className="flex items-center space-x-1">
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                                            </div>
                                                        ) : (
                                                            message.content
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
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