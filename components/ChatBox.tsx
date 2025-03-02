'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface ChatBoxProps {
    handle: string
    agentName: string
    agentImage: string
}

export function ChatBox({ handle, agentName, agentImage }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const source = searchParams?.get('source')
    
    // Debug logging for props and params
    useEffect(() => {
        console.log('ChatBox mounted with props:', { handle, agentName, agentImage });
        console.log('URL params:', { source });
    }, [handle, agentName, agentImage, source]);
    
    // Initialize messages after component mounts to prevent hydration errors
    useEffect(() => {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `Hi there! I'm ${agentName}. How can I help you today?`
            }
        ])
    }, [agentName])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!input.trim() || isLoading) return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Determine which API endpoint to use based on the source
            const apiEndpoint = source === 'agent_chain_users' 
                ? '/api/onchain-agent-chat' 
                : '/api/agent-chat'
            
            console.log(`[DEBUG] Using API endpoint: ${apiEndpoint} for agent: ${handle} with source: ${source}`);
            console.log(`[DEBUG] Request payload:`, { handle, message: input });
            
            // Call the appropriate API endpoint
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle,
                    message: input,
                }),
            })

            console.log(`[DEBUG] API response status:`, response.status);
            console.log(`[DEBUG] API response status text:`, response.statusText);
            
            const data = await response.json()
            console.log('[DEBUG] API response data:', data);

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            // Add assistant message from API response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error getting agent response:', error);

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Sorry, I encountered an error while processing your request. Please try again.'
                }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <h3 className="font-medium">Chat with {agentName}</h3>
                {source === 'agent_chain_users' && (
                    <p className="text-xs opacity-80">Onchain Agent</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        id={message.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${agentName}...`}
                        className="min-h-[60px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-[60px] w-[60px] bg-indigo-600 hover:bg-indigo-700"
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
} 