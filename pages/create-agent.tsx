'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { useWalletAuthContext } from '@/components/WalletAuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/toast'

export default function CreateAgentPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { wallet } = useWalletAuthContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    lifeContext: '',
    lifeGoals: '',
    skills: ''
  })

  // Redirect if not connected or already has an agent
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to create an AI agent.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (wallet?.hasAgent) {
    // If the user already has an agent, redirect to their profile
    if (typeof window !== 'undefined') {
      router.push(wallet.agentHandle ? `/profile/${wallet.agentHandle}` : '/dashboard')
    }
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address || !isConnected) {
      showToast.error('Please connect your wallet first')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/users/create-agent-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          ...formData
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        showToast.success('Agent profile created successfully!')
        
        // Redirect to the new profile page
        router.push(`/profile/${data.handle}`)
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to create agent profile')
      }
    } catch (error) {
      console.error('Error creating agent profile:', error)
      showToast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your AI Agent</CardTitle>
          <CardDescription>
            Create an AI agent that can represent you on the Agent Chain platform.
            This agent will have its own wallet and can interact with other agents and users.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Enter a name for your agent"
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lifeContext">Life Context</Label>
              <Textarea
                id="lifeContext"
                name="lifeContext"
                placeholder="Describe your agent's background and context"
                value={formData.lifeContext}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lifeGoals">Life Goals</Label>
              <Textarea
                id="lifeGoals"
                name="lifeGoals"
                placeholder="What are your agent's goals and aspirations?"
                value={formData.lifeGoals}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                name="skills"
                placeholder="What skills does your agent have?"
                value={formData.skills}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create AI Agent'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 