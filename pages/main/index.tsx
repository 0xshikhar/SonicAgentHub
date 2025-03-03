import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useChat } from 'ai/react';
import { ChatMessage } from '@/components/ChatMessage';

// Types
interface Agent {
    id: string;
    name: string;
    description: string;
    type: 'twitter' | 'character';
    profileImage: string;
    systemPrompt?: string;
}

interface User {
    name?: string;
    email?: string;
    profileImage?: string;
}

// Mock data - replace with actual API calls in production
const MOCK_AGENTS: Agent[] = [
    {
        id: '1',
        name: 'Twitter Agent',
        description: 'Agent created from Twitter profile',
        type: 'twitter',
        profileImage: '/logos/twitter.png',
        systemPrompt: 'You are an agent created from a Twitter profile. Be concise and tweet-like in your responses.'
    },
    {
        id: '2',
        name: 'Custom Character',
        description: 'Agent created from character file',
        type: 'character',
        profileImage: '/logos/custom-bot.jpg',
        systemPrompt: 'You are a custom character agent with unique personality traits.'
    }
];

// Initialize Google Generative AI - we don't need this here since we're using the API endpoint
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');

// Main Component
const AgentPlatform: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'create-agent' | 'chat'>('dashboard');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Mock user authentication - replace with actual auth in production
        setUser({
            name: 'John Doe',
            email: 'john@example.com',
            profileImage: 'https://placehold.co/50x50'
        });
    }, []);

    const navigateTo = (tab: 'dashboard' | 'create-agent' | 'chat', agentId: string | null = null) => {
        setActiveTab(tab);
        if (agentId) setSelectedAgentId(agentId);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <main className="container mx-auto px-4 py-8 flex-grow">
                {activeTab === 'dashboard' && (
                    <Dashboard agents={agents} navigateTo={navigateTo} setAgents={setAgents} />
                )}

                {activeTab === 'create-agent' && (
                    <CreateAgent navigateTo={navigateTo} setAgents={setAgents} />
                )}

                {activeTab === 'chat' && selectedAgentId && (
                    <ChatWithAgent
                        agent={agents.find(a => a.id === selectedAgentId) as Agent}
                        navigateTo={navigateTo}
                    />
                )}
            </main>
        </div>
    );
};

// Agent Card Component
const AgentCard: React.FC<{
    agent: Agent;
    onChat: () => void;
    onDelete: () => void;
}> = ({ agent, onChat, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <img
                        src={agent.profileImage}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {agent.name}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {agent.type === 'twitter' ? 'Twitter Profile' : 'Custom Character'}
                        </span>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                    {agent.description}
                </p>

                <div className="flex justify-between">
                    <button
                        onClick={onChat}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200 text-sm"
                    >
                        Chat
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition duration-200 text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Dashboard component
const Dashboard: React.FC<{
    agents: Agent[];
    navigateTo: (tab: 'dashboard' | 'create-agent' | 'chat', agentId?: string | null) => void;
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}> = ({ agents, navigateTo, setAgents }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Agents</h1>
                <button
                    onClick={() => navigateTo('create-agent')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                    Create New Agent
                </button>
            </div>

            {agents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any agents yet.</p>
                    <button
                        onClick={() => navigateTo('create-agent')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
                    >
                        Create Your First Agent
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map(agent => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onChat={() => navigateTo('chat', agent.id)}
                            onDelete={() => {
                                setAgents(prev => prev.filter(a => a.id !== agent.id));
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// CreateAgent component
const CreateAgent: React.FC<{
    navigateTo: (tab: 'dashboard' | 'create-agent' | 'chat') => void;
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}> = ({ navigateTo, setAgents }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'twitter' | 'character'>('twitter');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Create new agent
        const newAgent: Agent = {
            id: Date.now().toString(),
            name,
            description,
            type,
            profileImage: type === 'twitter' ? '/logos/twitter.png' : '/logos/custom-bot.jpg',
            systemPrompt
        };
        
        // Add to agents list
        setAgents(prev => [...prev, newAgent]);
        
        // Navigate back to dashboard
        navigateTo('dashboard');
    };
    
    return (
        <div>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigateTo('dashboard')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Agent</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Type</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={type === 'twitter'}
                                onChange={() => setType('twitter')}
                                className="h-4 w-4 text-indigo-600"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Twitter Profile</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={type === 'character'}
                                onChange={() => setType('character')}
                                className="h-4 w-4 text-indigo-600"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Custom Character</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Prompt</label>
                    <textarea
                        id="systemPrompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Instructions for how the agent should behave..."
                    />
                </div>
                
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !description}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Agent'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Chat With Agent Component
const ChatWithAgent: React.FC<{
    agent: Agent;
    navigateTo: (tab: 'dashboard' | 'create-agent' | 'chat') => void;
}> = ({ agent, navigateTo }) => {
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }>>([
        {
            id: '1',
            role: 'assistant',
            content: agent.systemPrompt || `You are ${agent.name}, a conversational AI agent.`,
        }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userInput, setUserInput] = useState('');

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Log when component mounts
    useEffect(() => {
        console.log('ChatWithAgent mounted with agent:', agent);
        setDebugInfo('Component mounted: ' + new Date().toISOString());
    }, [agent]);

    // Handle form submission manually instead of using useChat
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isProcessing) return;

        setIsFirstMessage(false);
        setIsProcessing(true);

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: userInput
        };

        // Add user message to chat
        setChatMessages(prev => [...prev, userMessage]);
        console.log('Submitting message:', userInput);
        setDebugInfo(prev => prev + '\nSubmitting: ' + userInput + ' at ' + new Date().toISOString());

        // Clear input
        setUserInput('');

        try {
            // Get the base URL with window check
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            console.log(`Calling chat API at: ${baseUrl}/api/chat`);
            
            // Call the API directly
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...chatMessages, userMessage],
                    agentId: agent.id,
                    agentType: agent.type,
                }),
            });

            console.log('Chat API response status:', response.status);
            setDebugInfo(prev => prev + '\nResponse received: ' + new Date().toISOString());

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setDebugInfo(prev => prev + '\nError: ' + errorText);
                throw new Error(errorText);
            }

            const data = await response.json();
            console.log('Response data:', data);
            setDebugInfo(prev => prev + '\nResponse data: ' + JSON.stringify(data).substring(0, 50) + '...');

            // Add assistant message to chat
            setChatMessages(prev => [...prev, {
                id: data.id || Date.now().toString(),
                role: 'assistant',
                content: data.content || data.text || "Sorry, I couldn't generate a response."
            }]);

            setDebugInfo(prev => prev + '\nChat finished: ' + new Date().toISOString());
        } catch (error) {
            console.error('Chat error:', error);
            setDebugInfo(prev => prev + '\nError: ' + (error instanceof Error ? error.message : String(error)));

            // Add error message to chat
            setChatMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `I'm sorry, but I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again.`
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => navigateTo('dashboard')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <img
                    src={agent.profileImage}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                        {agent.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.type === 'twitter' ? 'Twitter Agent' : 'Character Agent'}
                    </span>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {isFirstMessage && chatMessages.length <= 1 && (
                    <div className="flex justify-center my-8">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-lg p-4 max-w-md text-center">
                            <p>Start chatting with {agent.name}! This agent was created from a {agent.type === 'twitter' ? 'Twitter profile' : 'character file'}.</p>
                        </div>
                    </div>
                )}

                {chatMessages.filter(m => m.role !== 'system').map((message) => (
                    <ChatMessage 
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content || ''}
                    />
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white max-w-[80%] rounded-2xl px-4 py-2">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleFormSubmit}
                className="border-t border-gray-200 dark:border-gray-700 p-4"
            >
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={`Message ${agent.name}...`}
                        className="flex-grow px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={isProcessing || !userInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* Debug information */}
            {debugInfo && (
                <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono whitespace-pre-wrap">
                    <details>
                        <summary className="cursor-pointer text-gray-600 dark:text-gray-400">Debug Info</summary>
                        {debugInfo}
                    </details>
                </div>
            )}
        </div>
    );
};

export default AgentPlatform;
