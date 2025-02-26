import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'ai';
import { GEMINI_LATEST } from '@/lib/constants';

// Initialize the Generative AI model
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY_1 || '';
console.log('API Key available:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No');
console.log('Using Gemini model:', GEMINI_LATEST);

const genAI = new GoogleGenerativeAI(API_KEY);

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    console.log('Chat API called with method:', req.method);
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { messages, agentId, agentType } = body;
        
        console.log('Request received:', { 
            agentId, 
            agentType, 
            messageCount: messages?.length || 0 
        });

        // Get the last user message
        const lastUserMessage = messages.filter(
            (message: Message) => message.role === 'user'
        ).pop();

        if (!lastUserMessage) {
            console.log('No user message found in the request');
            return new Response(
                JSON.stringify({ error: 'No user message found' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('Last user message:', lastUserMessage.content);

        // Extract system message if present
        const systemMessage = messages.find(
            (message: Message) => message.role === 'system'
        );

        // Prepare chat history for the model
        const chatHistory = messages
            .filter((message: Message) => message.role !== 'system')
            .map((message: Message) => ({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.content }],
            }));

        console.log('Chat history prepared with', chatHistory.length, 'messages');

        // Create safety settings for the model
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        // Initialize model based on agent type
        console.log('Initializing Gemini model');
        const model = genAI.getGenerativeModel({
            model: GEMINI_LATEST,
            safetySettings
        });

        // Create chat session
        console.log('Starting chat session');
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: agentType === 'twitter' ? 0.7 : 0.8,
                topP: 0.95,
            },
        });

        // Add system message as a primer if available
        let systemPrompt = "You are a helpful AI assistant.";

        if (systemMessage) {
            systemPrompt = systemMessage.content;
            console.log('Using system prompt:', systemPrompt);
        }

        // Adjust prompt based on agent type
        if (agentType === 'twitter') {
            systemPrompt += " Keep your responses concise and tweet-like, using at most 280 characters.";
            console.log('Adjusted for Twitter agent');
        }

        // Generate response
        console.log('Sending message to Gemini');
        const result = await chat.sendMessage(
            `${systemPrompt}\n\nUser message: ${lastUserMessage.content}`
        );

        // Extract the response text
        const responseText = result.response.text();
        console.log('Received response from Gemini:', responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));

        // Return the response in the format expected by the AI package
        return new Response(
            JSON.stringify({
                role: 'assistant',
                content: responseText,
                id: Date.now().toString(),
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error generating response:', error);

        return new Response(
            JSON.stringify({
                error: 'Failed to generate response',
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
