'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatBox } from '@/components/ChatBox'
import { ArrowLeft, Twitter, User, MessageSquare, Info } from 'lucide-react'

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

export default function AgentDetailPage() {
  const router = useRouter()
  const { handle } = router.query
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Fetch agent data when handle is available
  useEffect(() => {
    async function fetchAgent() {
      if (!handle) return
      
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('agent_chain_general_agents')
          .select('*')
          .eq('handle', handle)
          .single()
        
        if (error) {
          throw error
        }
        
        if (data) {
          setAgent(data)
        }
      } catch (error) {
        console.error('Error fetching agent:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAgent()
  }, [handle])
  
  // Placeholder agent for when we're loading or have no data
  const placeholderAgent: Agent = {
    id: '1',
    handle: 'tech-innovator',
    name: 'Nader Dabit',
    description: 'Web3 & AI Innovation Hub. Building tech ecosystems in Palestine and beyond.',
    agent_type: 'twitter',
    profile_picture: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    twitter_handle: 'dabit3',
    traits: 'innovative,technical,community-focused,entrepreneurial',
    background: 'Leading Web3 & AI Innovation Hub in Ramallah. Formerly DevRel for MegaETH, EigenLayer Whisperer, AI Maximalist, Agent Blueprint Broker.',
    system_prompt: 'You are a tech innovator',
    is_public: true,
    created_at: new Date().toISOString()
  }
  
  // Use placeholder agent if we're loading or have no data
  const displayAgent = agent || placeholderAgent
  const traitsList = displayAgent.traits.split(',').map(trait => trait.trim())
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push('/agent')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </div>
        
        {/* Agent Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden">
                <Image
                  src={displayAgent.profile_picture}
                  alt={`${displayAgent.name}'s profile picture`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{displayAgent.name}</h1>
                {displayAgent.twitter_handle && (
                  <div className="flex items-center mt-1 text-gray-500">
                    <Twitter className="h-4 w-4 mr-1" />
                    <span>@{displayAgent.twitter_handle}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                  {displayAgent.agent_type === 'twitter' ? 'Twitter Profile' : 'Custom Character'}
                </Badge>
                
                {displayAgent.twitter_handle && (
                  <Link href={`https://twitter.com/${displayAgent.twitter_handle}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Twitter className="h-4 w-4" />
                      View on Twitter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <p className="mt-4 text-gray-700">{displayAgent.description}</p>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Traits</h3>
              <div className="flex flex-wrap gap-2">
                {traitsList.map((trait) => (
                  <Badge 
                    key={trait} 
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="mr-2 h-5 w-5 text-indigo-500" />
                About
              </h2>
              
              {displayAgent.background && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Background</h3>
                  <p className="text-gray-700">{displayAgent.background}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Agent Type</h3>
                <div className="flex items-center">
                  {displayAgent.agent_type === 'twitter' ? (
                    <>
                      <Twitter className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="text-gray-700">Twitter Profile</span>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-purple-400 mr-2" />
                      <span className="text-gray-700">Custom Character</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-indigo-500" />
                Chat with {displayAgent.name}
              </h2>
              
              <div className="h-[500px]">
                <ChatBox 
                  handle={displayAgent.handle}
                  agentName={displayAgent.name}
                  agentImage={displayAgent.profile_picture}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 