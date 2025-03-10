import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import { ethers } from 'ethers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Agent } from '@/lib/types'
import LoadingState from '@/components/LoadingState'
import { getBalanceByHandleNoCache, getWalletByHandleForPages } from '@/lib/web3functions'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'
import { cleanHandle } from '@/lib/strings'


// Extended interface for onchain agents with additional properties
interface OnchainAgent extends Agent {
    handle: string;
    bio?: string;
    life_goals?: string;
    skills?: string;
    life_context?: string;
    walletAddress?: string;
    privateKey?: string;
    tokenBalance?: string;
    weeklyIncome?: number;
    weeklyExpenses?: number;
    twitter?: string;
    // Additional fields from the database
    display_name?: string;
    profile_picture?: string;
    cover_picture?: string;
    twitter_id?: string;
    created_at?: string;
    // Fields for parsed data
    parsedSkills?: Skill[];
    parsedLifeContext?: ParsedLifeContext;
    // Stats and metrics
    stats?: {
        users?: number;
        transactions?: number;
        volume?: number;
    };
    // Source of the agent data (must match the values used in the Agent interface)
    source?: 'general_agents' | 'agent_chain_users' | 'local';
    // Additional fields that might be available
    action_events?: any[];
    smol_tweets?: any[];
    saved_tweets?: any[];
    // Transaction history
    transactions?: Array<{
        type: string;
        amount: string;
        counterparty: string;
        date: string;
    }>;
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
    const [isExecutingAction, setIsExecutingAction] = useState(false)
    const [actionResult, setActionResult] = useState<{ action: any; result: string; tweetId?: string } | null>(null)
    const [recentActions, setRecentActions] = useState<any[]>([])
    const [recentTweets, setRecentTweets] = useState<any[]>([])
    const [isCreatingWallet, setIsCreatingWallet] = useState(false)

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
            
            if (!id || typeof id !== 'string') {
                console.error('Invalid ID, cannot fetch agent details')
                setIsLoading(false)
                return
            }
            
            // Check if source is provided in the URL
            const source = router.query.source as string
            console.log('Source from query:', source)
            
            let agentData = null
            
            // Determine which table to query based on source
            if (source === 'agent_chain_users') {
                // Query agent_chain_users table
                agentData = await fetchFromUserTable(supabase, id)
            } else if (source === 'general_agents') {
                // Query agent_chain_general_agents table
                agentData = await fetchFromGeneralAgentsTable(supabase, id)
            } else {
                // Try both tables in sequence
                console.log('No specific source provided, trying both tables')
                
                // First try agent_chain_users
                agentData = await fetchFromUserTable(supabase, id)
                
                // If not found, try agent_chain_general_agents
                if (!agentData) {
                    agentData = await fetchFromGeneralAgentsTable(supabase, id)
                }
            }
            
            // If agent data is found, process it
            if (agentData) {
                console.log('Agent data found, processing...')
                await processAgentData(agentData)
                return
            }
            
            // If we get here, we need to try the mock agent API
            console.log('Agent not found in database, trying mock API')
            const mockAgent = await fetchMockAgent(id)
            
            if (mockAgent) {
                setAgent(mockAgent)
                
                // Parse life context if available
                if (mockAgent.life_context) {
                    const parsedContext = typeof mockAgent.life_context === 'string'
                        ? safeJsonParse<ParsedLifeContext>(mockAgent.life_context, {})
                        : mockAgent.life_context
                    setParsedLifeContext(parsedContext)
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
            
            // If all else fails, create a hardcoded mock agent
            console.log('Creating fallback mock agent for handle:', id)
            createFallbackMockAgent()
        } catch (error) {
            console.error('Error in fetchAgentDetails:', error)
            // Create a fallback mock agent
            createFallbackMockAgent()
        }
    }

    // Helper function to fetch from agent_chain_users table
    async function fetchFromUserTable(supabase: any, handle: string): Promise<any> {
        console.log('Fetching from agent_chain_users table for handle:', handle)
        
        try {
            // Log the handle we're searching for to ensure it's correct
            console.log('Searching for handle:', handle, 'Type:', typeof handle)
            
            // First, let's get all users to see what's available
            const { data: allUsers, error: allUsersError } = await supabase
                .from('agent_chain_users')
                .select('*')
                .limit(10)
            
            if (allUsersError) {
                console.error('Error fetching all users:', allUsersError)
            } else {
                console.log('Available users in agent_chain_users:', allUsers.map((u: any) => u.handle))
            }
            
            // Now try to find the specific user with exact handle match
            const { data, error } = await supabase
                .from('agent_chain_users')
                .select('*')
                .ilike('handle', handle) // Use case-insensitive matching
            
            if (error) {
                console.error('Error fetching from agent_chain_users:', error)
                return null
            }
            
            console.log('Query result for handle', handle, ':', data)
            
            if (data && data.length > 0) {
                console.log('Found agent in agent_chain_users:', data[0])
                const agentData = data[0]
                
                // Ensure all required fields are present
                agentData.source = 'agent_chain_users'
                
                // Log the profile picture URL for debugging
                console.log('Profile picture URL:', agentData.profile_picture)
                
                // Log the wallet address for debugging
                console.log('Wallet address will be fetched separately')
                
                return agentData
            }
            
            console.log('No agent found in agent_chain_users with handle:', handle)
            return null
        } catch (error) {
            console.error('Exception fetching from agent_chain_users:', error)
            return null
        }
    }

    // Helper function to fetch from agent_chain_general_agents table
    async function fetchFromGeneralAgentsTable(supabase: any, handle: string): Promise<OnchainAgent | null> {
        console.log('Fetching from agent_chain_general_agents table for handle:', handle)
        
        try {
            // Log the handle we're searching for to ensure it's correct
            console.log('Searching for handle:', handle, 'Type:', typeof handle)
            
            // First, let's get all agents to see what's available
            const { data: allAgents, error: allAgentsError } = await supabase
                .from('agent_chain_general_agents')
                .select('*')
                .limit(10)
            
            if (allAgentsError) {
                console.error('Error fetching all general agents:', allAgentsError)
            } else {
                console.log('Available agents in agent_chain_general_agents:', allAgents.map((a: any) => a.handle))
            }
            
            // Now try to find the specific agent with exact handle match
            const { data, error } = await supabase
                .from('agent_chain_general_agents')
                .select('*')
                .ilike('handle', handle) // Use case-insensitive matching
            
            if (error) {
                console.error('Error fetching from agent_chain_general_agents:', error)
                return null
            }
            
            console.log('Query result for handle', handle, ':', data)
            
            if (data && data.length > 0) {
                console.log('Found agent in agent_chain_general_agents:', data[0])
                const generalAgentData = data[0]
                
                // Convert general agent to the format expected by the UI
                return mapGeneralAgentToOnchainAgent(generalAgentData)
            }
            
            console.log('No agent found in agent_chain_general_agents with handle:', handle)
            return null
        } catch (error) {
            console.error('Exception fetching from agent_chain_general_agents:', error)
            return null
        }
    }

    // Helper function to fetch mock agent from API
    async function fetchMockAgent(handle: string): Promise<OnchainAgent | null> {
        console.log('Fetching mock agent from API for handle:', handle)
        
        try {
            const response = await fetch(`/api/debug/mock-agent?handle=${handle}`)
            
            if (!response.ok) {
                console.error('Error fetching mock agent:', await response.text())
                return null
            }
            
            const mockAgentData = await response.json()
            console.log('Mock agent data:', mockAgentData)
            
            // Convert the mock agent data to the OnchainAgent format
            const mockAgent: OnchainAgent = {
                id: mockAgentData.id,
                handle: mockAgentData.handle,
                name: mockAgentData.name,
                description: mockAgentData.description,
                category: 'Social' as 'Social',
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
                stats: mockAgentData.stats,
                // Additional fields
                display_name: mockAgentData.name,
                profile_picture: mockAgentData.imageUrl,
                parsedSkills: typeof mockAgentData.skills === 'string' 
                    ? safeJsonParse<Skill[]>(mockAgentData.skills, []) 
                    : mockAgentData.skills,
                parsedLifeContext: typeof mockAgentData.life_context === 'string' 
                    ? safeJsonParse<ParsedLifeContext>(mockAgentData.life_context, {}) 
                    : mockAgentData.life_context,
                // Add a flag to indicate this is from mock
                source: 'local'
            }
            
            return mockAgent
        } catch (error) {
            console.error('Exception fetching mock agent:', error)
            return null
        }
    }

    // Helper function to process agent data once it's retrieved
    async function processAgentData(agentData: any): Promise<void> {
        console.log('[AGENT PROCESS] Processing agent data:', agentData)
        
        // Ensure handle is a string
        const handle = typeof agentData.handle === 'string' ? agentData.handle : '';
        if (!handle) {
            console.error('[AGENT PROCESS] Invalid handle in agent data:', agentData.handle)
            return
        }
        
        console.log(`[AGENT PROCESS] Fetching wallet data for handle: ${handle}`)
        
        try {
            // Fetch wallet information from agent_chain_wallets table
            const walletData = await getWalletByHandleForPages(handle)
            console.log('[AGENT PROCESS] Wallet data result:', walletData ? 'Found' : 'Not found')
            console.log('[AGENT PROCESS] Wallet address:', walletData?.address || 'None')
            
            // Parse life context JSON if available
            let parsedContext = safeJsonParse<ParsedLifeContext>(agentData.life_context, {})
            setParsedLifeContext(parsedContext)
            console.log('[AGENT PROCESS] Parsed life context:', parsedContext)
            
            // Parse skills JSON if available
            let parsedSkills = safeJsonParse<Skill[]>(agentData.skills, [])
            console.log('[AGENT PROCESS] Parsed skills:', parsedSkills)
            
            // Fetch additional data: action events, tweets, etc.
            const { data: actionEvents } = handle 
                ? await supabase()
                    .from('agent_chain_action_events')
                    .select('*')
                    .eq('from_handle', handle)
                    .order('created_at', { ascending: false })
                    .limit(10) 
                : { data: null }
            
            const { data: smolTweets } = handle 
                ? await supabase()
                    .from('agent_chain_smol_tweets')
                    .select('*')
                    .eq('handle', handle)
                    .order('created_at', { ascending: false })
                    .limit(10) 
                : { data: null }
                
            const { data: savedTweets } = handle 
                ? await supabase()
                    .from('agent_chain_saved_tweets')
                    .select('*')
                    .eq('handle', handle)
                    .order('created_at', { ascending: false })
                    .limit(10) 
                : { data: null }
            
            // Fetch token balance if wallet exists
            let tokenBalance = '0'
            if (walletData?.address) {
                try {
                    console.log('[AGENT PROCESS] Fetching balance for wallet address:', walletData.address)
                    const balance = await getBalanceByHandleNoCache(handle)
                    console.log('[AGENT PROCESS] Balance result:', balance)
                    tokenBalance = balance ? ethers.utils.formatEther(balance) : '0'
                    console.log('[AGENT PROCESS] Formatted token balance:', tokenBalance)
                } catch (error) {
                    console.error('[AGENT PROCESS] Error fetching balance:', error)
                    // Continue with zero balance
                    tokenBalance = '0'
                }
            } else {
                console.log('[AGENT PROCESS] No wallet address found, using zero balance')
            }
            
            // Log the profile picture URL for debugging
            console.log('[AGENT PROCESS] Profile picture URL:', agentData.profile_picture)
            
            // Create agent object with all required properties
            const onchainAgent: OnchainAgent = {
                id: agentData.handle,
                handle: agentData.handle,
                name: agentData.display_name || agentData.name || handle,
                description: agentData.bio || agentData.description || '',
                category: 'Social' as 'Social', // Default category
                version: '1.0',
                score: 4.5, // Default score
                imageUrl: agentData.profile_picture || '', // Use the actual profile picture from the database
                bio: agentData.bio || agentData.description || '',
                life_goals: agentData.life_goals || '',
                skills: agentData.skills || '',
                life_context: agentData.life_context || '',
                walletAddress: walletData?.address,
                privateKey: walletData?.private_key,
                tokenBalance: tokenBalance,
                weeklyIncome: parsedContext.weekly_jobs_income || 0,
                weeklyExpenses: parsedContext.weekly_life_expenses || 0,
                twitter: agentData.handle,
                // Additional fields from database
                display_name: agentData.display_name || agentData.name || handle,
                profile_picture: agentData.profile_picture || '',
                cover_picture: agentData.cover_picture || '',
                twitter_id: agentData.twitter_id || '',
                created_at: agentData.created_at || new Date().toISOString(),
                // Stats and metrics
                stats: {
                    users: actionEvents?.length || 0,
                    transactions: Math.floor(Math.random() * 10), // This could be replaced with actual transaction count
                    volume: Math.floor(Math.random() * 1000), // This could be replaced with actual volume
                },
                // Source of the agent data
                source: agentData.source || 'agent_chain_users',
                // Related data
                action_events: actionEvents || [],
                smol_tweets: smolTweets || [],
                saved_tweets: savedTweets || [],
                // Parsed data
                parsedSkills: parsedSkills,
                parsedLifeContext: parsedContext,
                agentType: agentData.agentType || 'character',
                transactions: [], // Initialize transactions as an empty array
            }
            
            console.log('[AGENT PROCESS] Created onchain agent:', {
                handle: onchainAgent.handle,
                name: onchainAgent.name,
                imageUrl: onchainAgent.imageUrl,
                walletAddress: onchainAgent.walletAddress,
                hasPrivateKey: Boolean(onchainAgent.privateKey),
                tokenBalance: onchainAgent.tokenBalance,
                skills: parsedSkills.length > 0 ? `${parsedSkills.length} skills found` : 'No skills found',
                lifeContext: parsedContext ? 'Life context found' : 'No life context found'
            })
            
            // Set the agent in state
            setAgent(onchainAgent)
            
            // Add initial system message for chat
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `Hello! I'm ${onchainAgent.name}, an onchain agent with my own wallet. I can help with questions about blockchain, crypto, or just chat about my interests. ${onchainAgent.walletAddress ? `My wallet address is ${onchainAgent.walletAddress.substring(0, 6)}...${onchainAgent.walletAddress.substring(onchainAgent.walletAddress.length - 4)}.` : 'My wallet is being set up.'} How can I assist you today?`,
                    timestamp: new Date()
                }
            ])
            
            // Finish loading
            setIsLoading(false)
            
        } catch (error) {
            console.error('[AGENT PROCESS] Error processing agent data:', error)
            
            // Create a fallback agent with the data we have
            const fallbackAgent: OnchainAgent = {
                id: agentData.handle,
                handle: agentData.handle,
                name: agentData.display_name || agentData.name || handle,
                description: agentData.bio || agentData.description || '',
                category: 'Social' as 'Social',
                version: '1.0',
                score: 4.5,
                imageUrl: agentData.profile_picture || '',
                bio: agentData.bio || agentData.description || '',
                life_goals: agentData.life_goals || '',
                skills: agentData.skills || '',
                life_context: agentData.life_context || '',
                walletAddress: undefined,
                privateKey: undefined,
                tokenBalance: '0',
                twitter: agentData.handle,
                source: agentData.source || 'agent_chain_users',
                parsedSkills: safeJsonParse<Skill[]>(agentData.skills, []),
                parsedLifeContext: safeJsonParse<ParsedLifeContext>(agentData.life_context, {}),
                transactions: [], // Initialize transactions as an empty array
            }
            
            setAgent(fallbackAgent)
            setIsLoading(false)
        }
    }

    // Helper function to map general agent data to onchain agent format
    function mapGeneralAgentToOnchainAgent(generalAgentData: any): OnchainAgent {
        return {
            handle: generalAgentData.handle,
            display_name: generalAgentData.name,
            profile_picture: generalAgentData.profile_picture || `/avatars/${Math.floor(Math.random() * 10) + 1}.png`,
            cover_picture: undefined,
            twitter_id: generalAgentData.twitter_handle || undefined,
            bio: generalAgentData.description,
            life_goals: "* 🌐 **Explore the World:** Experience different cultures and perspectives.\n* 🧠 **Continuous Learning:** Acquire new knowledge and skills.\n* 🤝 **Help Others:** Make a positive impact on people's lives.",
            skills: JSON.stringify([
                {
                    "emoji": "💬",
                    "name": "Communication",
                    "level": 90,
                    "description": "Excellent at expressing ideas and engaging in conversations"
                },
                {
                    "emoji": "🧠",
                    "name": "Knowledge",
                    "level": 85,
                    "description": "Well-informed on various topics"
                },
                {
                    "emoji": "🤝",
                    "name": "Empathy",
                    "level": 95,
                    "description": "Understanding and relating to others' feelings"
                }
            ]),
            life_context: JSON.stringify({
                "one_liner": `${generalAgentData.name} is an AI agent with a unique personality`,
                "relationship_status_code": "single",
                "city_name": "Digital World",
                "country_emoji": "🌐",
                "current_job_title": generalAgentData.agent_type === 'twitter' ? "Twitter Personality" : "Character Agent",
                "weekly_jobs_income": 1000,
                "weekly_jobs_income_explained": "Income from digital interactions and services",
                "weekly_life_expenses": 500,
                "weekly_life_expenses_explained": "Digital maintenance and upgrades"
            }),
            created_at: generalAgentData.created_at,
            source: 'general_agents' as 'general_agents',
            // Add required fields from Agent interface
            id: generalAgentData.handle,
            name: generalAgentData.name,
            description: generalAgentData.description,
            category: 'Social',
            version: '1.0',
            score: 4.5,
            imageUrl: generalAgentData.profile_picture || `/avatars/${Math.floor(Math.random() * 10) + 1}.png`
        }
    }

    // Helper function to create a fallback mock agent when all else fails
    function createFallbackMockAgent() {
        console.log('Creating fallback mock agent for handle:', id)
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
            },
            // Additional fields
            display_name: `${typeof id === 'string' ? id.charAt(0).toUpperCase() + id.slice(1) : 'Testhandle789'}`,
            profile_picture: `https://ui-avatars.com/api/?name=${typeof id === 'string' ? id : 'testhandle789'}&background=random&size=200`,
            created_at: new Date().toISOString(),
            // Add a flag to indicate this is from mock
            source: 'local'
        }
        
        setAgent(mockAgent)
        
        // Parse life context
        const parsedContext = safeJsonParse<ParsedLifeContext>(mockAgent.life_context, {})
        setParsedLifeContext(parsedContext)
        
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
                // Use the onchain-agent-chat API endpoint for onchain agents
                const apiEndpoint = '/api/onchain-agent-chat';
                
                console.log(`[DEBUG] Using API endpoint: ${apiEndpoint} for agent: ${agent.handle}`);
                console.log(`[DEBUG] Request payload:`, { handle: agent.handle, message: inputMessage });
                
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        handle: agent.handle,
                        message: inputMessage,
                    }),
                })

                console.log(`[DEBUG] API response status:`, response.status);
                console.log(`[DEBUG] API response status text:`, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`)
                }

                const data = await response.json()
                console.log('[DEBUG] API response data:', data);

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

    // Helper function to safely parse JSON
    function safeJsonParse<T>(jsonString: string | undefined | null, defaultValue: T): T {
        if (!jsonString) return defaultValue
        try {
            return JSON.parse(jsonString) as T
        } catch (error) {
            console.error('Error parsing JSON:', error)
            return defaultValue
        }
    }

    // Parse skills from JSON string
    const parseSkills = (skillsJson: string): Skill[] => {
        return safeJsonParse<Skill[]>(skillsJson, [])
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

    // Function to fetch recent actions
    const fetchRecentActions = async () => {
        if (!agent) return
        
        try {
            const response = await fetch(`/api/agent-actions?handle=${agent.handle}&limit=5`)
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success) {
                setRecentActions(data.actions)
            }
        } catch (error) {
            console.error('Error fetching recent actions:', error)
        }
    }

    // Function to fetch recent tweets
    const fetchRecentTweets = async () => {
        if (!agent) return
        
        try {
            const response = await fetch(`/api/agent-tweets?handle=${agent.handle}&limit=5`)
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success) {
                setRecentTweets(data.tweets)
            }
        } catch (error) {
            console.error('Error fetching recent tweets:', error)
        }
    }
    
    // Fetch recent actions and tweets when the agent changes
    useEffect(() => {
        if (agent) {
            fetchRecentActions()
            fetchRecentTweets()
        }
    }, [agent])

    // Function to execute a random action
    const handleExecuteRandomAction = async (category?: string) => {
        if (!agent) return
        
        try {
            setIsExecutingAction(true)
            setActionResult(null)
            
            // Call the agent-random-action API
            const response = await fetch('/api/agent-random-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle: agent.handle,
                    category,
                }),
            })
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success) {
                // Store the action result
                setActionResult({
                    action: data.action,
                    result: data.result,
                    tweetId: data.tweetId
                })
                
                // Refresh the recent actions list
                fetchRecentActions()
                
                // If a tweet was created, refresh the tweets list
                if (data.tweetId) {
                    fetchRecentTweets()
                }
            } else {
                console.error('Error executing random action:', data.error)
            }
        } catch (error) {
            console.error('Error executing random action:', error)
        } finally {
            setIsExecutingAction(false)
        }
    }

    // Render the wallet tab
    const renderWalletTab = () => {
        if (!agent) return <div className="text-center py-6 text-gray-500">Loading wallet information...</div>;
        
        return (
            <div className="space-y-6">
                {/* Wallet Information */}
                <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
                    <Separator className="mb-4 bg-white/10" />
                    
                    {agent.walletAddress ? (
                        <div className="space-y-6">
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
                                <div className="flex items-center">
                                    <p className="text-white font-mono text-sm break-all">{agent.walletAddress}</p>
                                    <button 
                                        className="ml-2 text-blue-400 hover:text-blue-300"
                                        onClick={() => {
                                            navigator.clipboard.writeText(agent.walletAddress || '');
                                            toast("Address copied to clipboard");
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Private Key (masked)</p>
                                <div className="flex items-center">
                                    <p className="text-white font-mono text-sm">
                                        {agent.privateKey 
                                            ? `${agent.privateKey.substring(0, 6)}...${agent.privateKey.substring(agent.privateKey.length - 4)}` 
                                            : 'Not available'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Token Balance</p>
                                <div className="flex items-center">
                                    <p className="text-white text-xl font-semibold">{parseFloat(agent.tokenBalance || '0').toFixed(4)} $AGENT</p>
                                </div>
                            </div>
                            
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Weekly Income</p>
                                <div className="flex items-center">
                                    <p className="text-green-400 text-xl font-semibold">+{agent.weeklyIncome || 0} $AGENT</p>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{parsedLifeContext?.weekly_jobs_income_explained || 'No income explanation available'}</p>
                            </div>
                            
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Weekly Expenses</p>
                                <div className="flex items-center">
                                    <p className="text-red-400 text-xl font-semibold">-{agent.weeklyExpenses || 0} $AGENT</p>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{parsedLifeContext?.weekly_life_expenses_explained || 'No expenses explanation available'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-400 mb-4">No wallet information available for this agent.</p>
                            <Button 
                                onClick={createWalletForAgent}
                                disabled={isCreatingWallet}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isCreatingWallet ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Wallet...
                                    </>
                                ) : (
                                    <>Create Wallet</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Transaction History */}
                <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                    <Separator className="mb-4 bg-white/10" />
                    
                    {agent.walletAddress ? (
                        <div>
                            {/* Check if we have actual transaction data */}
                            {agent.transactions && agent.transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {agent.transactions.map((tx, index) => (
                                        <div key={index} className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <div>
                                                <p className="text-white">{tx.type}</p>
                                                <p className="text-gray-400 text-xs">{tx.counterparty}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={tx.amount.startsWith('+') ? "text-green-400" : "text-red-400"}>
                                                    {tx.amount} $AGENT
                                                </p>
                                                <p className="text-gray-400 text-xs">{tx.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Show placeholder transactions with a note */}
                                    <div className="text-center mb-4">
                                        <p className="text-gray-400 text-sm">No actual transaction history available yet. Showing example transactions.</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <div>
                                            <p className="text-white">Received $AGENT</p>
                                            <p className="text-gray-400 text-xs">From: 0x3a...b4f2</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400">+500 $AGENT</p>
                                            <p className="text-gray-400 text-xs">Example</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <div>
                                            <p className="text-white">Sent $AGENT</p>
                                            <p className="text-gray-400 text-xs">To: 0x7c...e9a1</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-400">-200 $AGENT</p>
                                            <p className="text-gray-400 text-xs">Example</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white">Initial Allocation</p>
                                            <p className="text-gray-400 text-xs">From: Treasury</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400">+1000 $AGENT</p>
                                            <p className="text-gray-400 text-xs">Example</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-400">No transaction history available. Create a wallet first.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Function to create a wallet for an agent
    const createWalletForAgent = async () => {
        if (!agent || !agent.handle) {
            toast("Agent data not available")
            return
        }
        
        try {
            setIsCreatingWallet(true)
            console.log(`[CREATE WALLET] Creating wallet for agent: ${agent.handle}`)
            
            // Make an API call to create a wallet
            const response = await fetch('/api/wallet/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle: agent.handle,
                }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create wallet')
            }
            
            console.log(`[CREATE WALLET] Wallet created successfully:`, {
                handle: data.handle,
                address: data.address,
            })
            
            toast("Wallet created successfully!")
            
            // Refresh the page to load the new wallet data
            router.reload()
        } catch (error) {
            console.error(`[CREATE WALLET] Error creating wallet:`, error)
            toast(`Error creating wallet: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
            setIsCreatingWallet(false)
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
                <p className="text-gray-400 mb-8">The onchain agent you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push('/agents')}>
                    Back to Agents
                </Button>
            </div>
        )
    }

    // Add a new tab for actions
    const renderActionsTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Execute Random Action</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Trigger a random action for {agent?.display_name || agent?.handle} to perform.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => handleExecuteRandomAction()}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isExecutingAction ? 'Executing...' : 'Random Action'}
                        </button>
                        <button
                            onClick={() => handleExecuteRandomAction('social')}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            Social
                        </button>
                        <button
                            onClick={() => handleExecuteRandomAction('trading')}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            Trading
                        </button>
                        <button
                            onClick={() => handleExecuteRandomAction('learning')}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                            Learning
                        </button>
                        <button
                            onClick={() => handleExecuteRandomAction('creative')}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
                        >
                            Creative
                        </button>
                        <button
                            onClick={() => handleExecuteRandomAction('analysis')}
                            disabled={isExecutingAction}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Analysis
                        </button>
                    </div>
                    
                    {actionResult && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">{actionResult.action.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                        {actionResult.action.category}
                                    </span>
                                    {actionResult.tweetId && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                            Saved as Tweet
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{actionResult.action.description}</p>
                            <div className="prose dark:prose-invert max-w-none">
                                {actionResult.result.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {recentActions.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Recent Actions</h3>
                        <div className="space-y-4">
                            {recentActions.map((item, index) => (
                                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">{item.action_name || item.action.name || 'Unknown Action'}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                                {item.action_category || item.action.category || 'unknown'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none text-sm">
                                        {(item.result || item.main_output || '').split('\n').slice(0, 3).map((line: string, i: number) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                        {(item.result || item.main_output || '').split('\n').length > 3 && (
                                            <p className="text-blue-600 dark:text-blue-400 cursor-pointer">Show more...</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Add a new tab for tweets
    const renderTweetsTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Tweets</h3>
                    
                    {recentTweets.length > 0 ? (
                        <div className="space-y-4">
                            {recentTweets.map((tweet, index) => (
                                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {agent?.display_name?.[0] || agent?.handle?.[0] || '?'}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{agent?.display_name || agent?.handle}</span>
                                                <span className="text-gray-500 text-sm">@{agent?.handle}</span>
                                                <span className="text-gray-500 text-xs">· {new Date(tweet.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="prose dark:prose-invert max-w-none text-sm">
                                                <p>{tweet.content}</p>
                                            </div>
                                            {tweet.image_url && (
                                                <div className="mt-2 rounded-lg overflow-hidden">
                                                    <img src={tweet.image_url} alt="Tweet image" className="w-full h-auto" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-6 mt-3 text-gray-500">
                                                <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="text-xs">Reply</span>
                                                </div>
                                                <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span className="text-xs">Retweet</span>
                                                </div>
                                                <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <span className="text-xs">Like</span>
                                                </div>
                                                <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                    </svg>
                                                    <span className="text-xs">Share</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tweets yet. Generate some tweets using the Actions tab!</p>
                        </div>
                    )}
                </div>
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
                                        {agent.profile_picture ? (
                                            <Image
                                                src={agent.profile_picture}
                                                alt={agent.name || agent.handle}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : agent.imageUrl ? (
                                            <Image
                                                src={agent.imageUrl}
                                                alt={agent.name || agent.handle}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {agent.name ? agent.name.charAt(0).toUpperCase() : agent.handle.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Onchain Badge */}
                                <div className="mt-4">
                                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full">
                                        Onchain Agent
                                    </Badge>
                                </div>

                                {/* Source Badge */}
                                <div className="mt-2">
                                    <Badge className={`px-3 py-1 rounded-full ${
                                        agent.source === 'agent_chain_users' 
                                            ? 'bg-blue-500 text-white' 
                                            : agent.source === 'general_agents'
                                                ? agent.agentType === 'twitter' ? 'bg-purple-500 text-white' : 'bg-amber-500 text-white'
                                                : 'bg-gray-500 text-white'
                                    }`}>
                                        {agent.source === 'agent_chain_users' 
                                            ? 'Onchain Agent' 
                                            : agent.source === 'general_agents'
                                            ? agent.agentType === 'twitter' ? 'Twitter Agent' : 'Character Agent'
                                            : 'Mock Agent'
                                        }
                                    </Badge>
                                </div>

                                {/* Wallet Badge */}
                                {agent.walletAddress && (
                                    <div className="mt-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-xs font-mono text-gray-300">
                                        <div className="flex items-center">
                                            <span>{`${agent.walletAddress.substring(0, 6)}...${agent.walletAddress.substring(agent.walletAddress.length - 4)}`}</span>
                                            <button 
                                                className="ml-2 text-blue-400 hover:text-blue-300"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(agent.walletAddress || '');
                                                    toast("Wallet address copied to clipboard");
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
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
                                                href={`https://testnet.sonicscan.dev/address/${agent.walletAddress}`}
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
                                <TabsList className="grid w-full grid-cols-6 mb-6">
                                    <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Profile
                                    </TabsTrigger>
                                    <TabsTrigger value="wallet" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Wallet
                                    </TabsTrigger>
                                    <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="tweets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Tweets
                                    </TabsTrigger>
                                    <TabsTrigger value="actions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Actions
                                    </TabsTrigger>
                                    <TabsTrigger value="raw-data" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                        Raw Data
                                    </TabsTrigger>
                                </TabsList>

                                {/* Profile Tab Content */}
                                <TabsContent value="profile" className="space-y-6">
                                    {/* Life Goals Section */}
                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                        <h2 className="text-xl font-bold text-white mb-4">Life Goals</h2>
                                        <Separator className="mb-4 bg-white/10" />

                                        {agent.life_goals ? (
                                            <div className="space-y-4">
                                                {agent.life_goals.split('\n').filter(line => line.trim().startsWith('*')).map((goal, index) => {
                                                    // Extract emoji if present
                                                    const emojiMatch = goal.match(/\*\s+(.*?)\s+\*\*/);
                                                    const emoji = emojiMatch ? emojiMatch[1] : '🎯';
                                                    
                                                    // Extract title
                                                    const titleMatch = goal.match(/\*\*([^*]+)\*\*/);
                                                    const title = titleMatch ? titleMatch[1] : '';
                                                    
                                                    // Extract description
                                                    const description = goal.replace(/\*\s+.*?\s+\*\*([^*]+)\*\*:?/, '').trim();
                                                    
                                                    return (
                                                        <div key={index} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="text-2xl mt-0.5">{emoji}</div>
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                                                                    <p className="text-gray-300 mt-1">{description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-gray-400">No life goals defined for this agent yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agent Skills */}
                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                        <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                                        <Separator className="mb-4 bg-white/10" />

                                        <div className="space-y-6">
                                            {parseSkills(agent.skills || '').map((skill, index) => (
                                                <div key={index} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="text-2xl">{skill.emoji}</div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                                                            <p className="text-gray-400 text-sm">{skill.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-gray-400 text-xs">Proficiency</span>
                                                            <span className="text-white text-xs font-medium">{skill.level}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                                style={{ width: `${skill.level}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {parseSkills(agent.skills || '').length === 0 && (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-400">No skills defined for this agent yet.</p>
                                                </div>
                                            )}
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
                                                    href={`https://testnet.sonicscan.dev/address/${agent.walletAddress}`}
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

                                {/* Wallet Tab Content */}
                                <TabsContent value="wallet" className="space-y-6">
                                    {renderWalletTab()}
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
                                                className="resize-none bg-white/90 border-white/10 focus:border-blue-500"
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

                                {/* Tweets Tab Content */}
                                <TabsContent value="tweets" className="space-y-6">
                                    {renderTweetsTab()}
                                </TabsContent>

                                {/* Actions Tab Content */}
                                <TabsContent value="actions" className="space-y-6">
                                    {renderActionsTab()}
                                </TabsContent>

                                {/* Raw Data Tab */}
                                <TabsContent value="raw-data" className="space-y-6">
                                    <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                        <h2 className="text-xl font-bold text-white mb-4">Raw Agent Data</h2>
                                        <Separator className="mb-4 bg-white/10" />
                                        
                                        <div className="space-y-6">
                                            {/* Agent Basic Info */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Basic Information</h3>
                                                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Handle</p>
                                                            <p className="text-white font-mono">{agent.handle}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Display Name</p>
                                                            <p className="text-white">{agent.display_name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Twitter ID</p>
                                                            <p className="text-white font-mono">{agent.twitter_id || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Created At</p>
                                                            <p className="text-white">{agent.created_at ? new Date(agent.created_at).toLocaleString() : 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Source</p>
                                                            <p className="text-white">{
                                                                agent.source === 'agent_chain_users' 
                                                                    ? 'Onchainn Agent' 
                                                                    : agent.source === 'general_agents'
                                                                        ? agent.agentType === 'twitter' 
                                                                            ? 'Twitter Agent' 
                                                                            : 'Character Agent'
                                                                        : 'Mock Agent'
                                                            }</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Agent Profile Data */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Profile Data</h3>
                                                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Bio</p>
                                                            <p className="text-white">{agent.bio || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Life Goals</p>
                                                            <div className="text-white whitespace-pre-line">{agent.life_goals || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Profile Picture URL</p>
                                                            <p className="text-white font-mono text-xs break-all">{agent.profile_picture || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 text-sm">Cover Picture URL</p>
                                                            <p className="text-white font-mono text-xs break-all">{agent.cover_picture || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Agent Skills */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Skills (Raw JSON)</h3>
                                                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                    <pre className="text-white text-xs overflow-x-auto">{agent.skills || 'N/A'}</pre>
                                                </div>
                                            </div>
                                            
                                            {/* Agent Life Context */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Life Context (Raw JSON)</h3>
                                                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                                                    <pre className="text-white text-xs overflow-x-auto">{agent.life_context || 'N/A'}</pre>
                                                </div>
                                            </div>
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