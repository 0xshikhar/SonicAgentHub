'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AgentCard } from '@/components/AgentCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Define the Agent interface based on our database schema
interface Agent {
  id: string
  handle: string
  name: string
  description: string
  agent_type: 'twitter' | 'character'
  profile_picture: string
  twitter_handle?: string
  traits: string
  background?: string
  system_prompt: string
  is_public: boolean
  created_at: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [agentType, setAgentType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Fetch agents on component mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('agent_chain_general_agents')
          .select('*')
          .eq('is_public', true)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setAgents(data)
          setFilteredAgents(data)
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAgents()
  }, [])
  
  // Filter and sort agents when filters change
  useEffect(() => {
    let result = [...agents]
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        agent => 
          agent.name.toLowerCase().includes(term) || 
          agent.description.toLowerCase().includes(term) ||
          (agent.traits && agent.traits.toLowerCase().includes(term))
      )
    }
    
    // Filter by agent type
    if (agentType !== 'all') {
      result = result.filter(agent => agent.agent_type === agentType)
    }
    
    // Sort agents
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    setFilteredAgents(result)
  }, [agents, searchTerm, agentType, sortBy])
  
  // Placeholder agents for when we're loading or have no data
  const placeholderAgents = [
    {
      id: '1',
      handle: 'tech-innovator',
      name: 'Nader Dabit',
      description: 'Web3 & AI Innovation Hub. Building tech ecosystems in Palestine and beyond.',
      agent_type: 'twitter' as const,
      profile_picture: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      twitter_handle: 'dabit3',
      traits: 'innovative,technical,community-focused,entrepreneurial',
      background: 'Leading Web3 & AI Innovation Hub in Ramallah',
      system_prompt: 'You are a tech innovator',
      is_public: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      handle: 'ai-researcher',
      name: 'Dr. Maya Chen',
      description: 'AI Researcher specializing in LLMs and agent systems. Exploring the frontier of autonomous AI agents.',
      agent_type: 'character' as const,
      profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
      twitter_handle: 'drmayaai',
      traits: 'analytical,innovative,detail-oriented,collaborative',
      background: 'PhD in Computer Science with focus on AI systems',
      system_prompt: 'You are an AI researcher',
      is_public: true,
      created_at: new Date().toISOString()
    }
  ]
  
  // Use placeholder agents if we're loading or have no data
  const displayAgents = isLoading || filteredAgents.length === 0 
    ? placeholderAgents 
    : filteredAgents

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Agents Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Discover and interact with AI agents based on real Twitter profiles or custom characters
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search agents by name, description, or traits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={agentType} onValueChange={setAgentType}>
                <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Agent Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="twitter">Twitter Profiles</SelectItem>
                  <SelectItem value="character">Custom Characters</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Featured Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Sparkles className="mr-2 text-yellow-500" size={20} />
              Featured Agents
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayAgents.slice(0, 4).map((agent) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                handle={agent.handle}
                name={agent.name}
                imageUrl={agent.profile_picture}
                description={agent.description}
                traits={agent.traits}
                background={agent.background}
                twitterHandle={agent.twitter_handle}
              />
            ))}
          </div>
        </div>
        
        {/* All Agents Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">All Agents</h2>
            
            <Tabs defaultValue="grid" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  handle={agent.handle}
                  name={agent.name}
                  imageUrl={agent.profile_picture}
                  description={agent.description}
                  traits={agent.traits}
                  background={agent.background}
                  twitterHandle={agent.twitter_handle}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {displayAgents.map((agent, index) => (
                <div 
                  key={agent.id}
                  className={`flex items-center p-4 ${
                    index !== displayAgents.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={agent.profile_picture}
                      alt={`${agent.name}'s profile picture`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate">{agent.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{agent.description}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-4"
                    asChild
                  >
                    <Link href={`/agent/${agent.handle}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
        
        {/* No results */}
        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm mt-8">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchTerm('')
                setAgentType('all')
                setSortBy('newest')
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 