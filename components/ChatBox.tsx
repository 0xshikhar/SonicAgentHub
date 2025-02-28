'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Send, Loader2 } from 'lucide-react'

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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hi there! I'm ${agentName}. How can I help you today?`
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

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
            // In a real implementation, this would call your API to get the agent's response
            // For now, we'll simulate a delay and return a mock response
            await new Promise(resolve => setTimeout(resolve, 1000))

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `As ${agentName}, I acknowledge your message: "${input}". In a real implementation, I would provide a thoughtful response based on my character and knowledge.`
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error getting response:', error)

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