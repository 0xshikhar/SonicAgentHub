import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GEMINI_LATEST, GEMINI_THINKING } from "./constants"
import { ChatMessage } from "./types";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CoreMessage, generateText } from "ai";

// Define the ChatSession interface
export interface ChatSession {
  role: 'user' | 'model';
  parts: string;
}

export const askGemini = async ({
  prompt,
  modelName = GEMINI_LATEST,
  useCase = "default",
}: {
  prompt: string;
  modelName?: string;
  useCase?: string;
}) => {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY_1!,
    process.env.GOOGLE_GEMINI_API_KEY_2!,
    process.env.GOOGLE_GEMINI_API_KEY_3!,
  ];

  const RANDOM_GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)] || '1';

  const genAI = new GoogleGenerativeAI(RANDOM_GEMINI_API_KEY);

  // Set temperature based on use case
  let temperature = 0.2; // Default temperature
  
  // Use higher temperature for agent chat to make responses more dynamic
  if (useCase === "agent-chat") {
    temperature = 0.7;
    console.log(" 🧠  calling Gemini for agent chat with temperature: " + temperature);
  }

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: temperature,
    },
  });
  
  console.log(" 🧠  calling Gemini... [" + useCase + "]");

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  console.log(" 🧠  done! [" + useCase + "]");
  return responseText;
};

export const askGeminiWithMessagesAndSystemPrompt = async ({
  messages,
  systemPrompt,
  temperature = 0.2,
}: {
  messages: ChatMessage[];
  systemPrompt: string;
  temperature?: number;
}) => {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY_1!,
    process.env.GOOGLE_GEMINI_API_KEY_2!,
    process.env.GOOGLE_GEMINI_API_KEY_3!,
  ];

  const RANDOM_GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)] || '';

  const genAI = new GoogleGenerativeAI(RANDOM_GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: GEMINI_LATEST,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: temperature, // Set your desired temperature here (e.g., 0.9 for more creativity)
    },
  });

  const lastMessageContent = messages[messages.length - 1]?.content;
  //   console.log(" 👀  MY LAST MESSAGE IS:", lastMessageContent);

  // edit all previous message so if role is assistant, change it to "model":
  const previousMessages = messages.slice(0, -1).map((message) => {
    if (message.role === "assistant") {
      return {
        role: "model",
        content: message.content,
      };
    }
    return message;
  });

  const chat = model.startChat({
    history: previousMessages as any[],
  });

  const result = await chat.sendMessage(lastMessageContent || '');
  const responseText = result.response.text();
  return responseText;
};

export const askGeminiThinking = async ({
  messages,
  temperature = 0.8,
  useCase = "default",  
}: {
  messages: CoreMessage[];
  temperature?: number;
  useCase?: string;
}) => {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY_1!,
    process.env.GOOGLE_GEMINI_API_KEY_2!,
    process.env.GOOGLE_GEMINI_API_KEY_3!,
  ];

  const RANDOM_GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)] || '';

  const google = createGoogleGenerativeAI({
    apiKey: RANDOM_GEMINI_API_KEY,
  });

  const { text } = await generateText({
    temperature,
    model: google(GEMINI_THINKING, {}),
    messages,
  });

  return text;
};

export async function generateGeminiResponse(
  prompt: string,
  systemPrompt?: string,
  history?: ChatSession[]
): Promise<string> {
  console.log('[DEBUG] generateGeminiResponse called with:', { 
    promptLength: prompt?.length, 
    systemPromptAvailable: Boolean(systemPrompt),
    historyAvailable: Boolean(history),
    historyLength: history?.length
  });

  try {
    console.log('[DEBUG] Checking for GEMINI_API_KEY');

    const keys = [
      process.env.GOOGLE_GEMINI_API_KEY_1!,
      process.env.GOOGLE_GEMINI_API_KEY_2!,
      process.env.GOOGLE_GEMINI_API_KEY_3!,
    ];
  
    const RANDOM_GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)] || '';
    
    if (!RANDOM_GEMINI_API_KEY) {
      console.error('[DEBUG] No valid Gemini API key found');
      return "I apologize, but I encountered an error while processing your request. Please try again later.";
    }

    console.log('[DEBUG] Using Gemini API key (length):', RANDOM_GEMINI_API_KEY.length);
    
    const genAI = new GoogleGenerativeAI(RANDOM_GEMINI_API_KEY);
    console.log('[DEBUG] GoogleGenerativeAI instance created');

    // Update to use the correct model name - gemini-1.5-pro or gemini-1.0-pro
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
      },
    });
    console.log('[DEBUG] Gemini model instance created with model: gemini-1.5-pro');

    let result;

    if (history && history.length > 0) {
      console.log('[DEBUG] Using chat mode with history');
      console.log('[DEBUG] History length:', history.length);
      
      const chat = model.startChat({
        history: history.map((session) => ({
          role: session.role as 'user' | 'model',
          parts: [{ text: session.parts }],
        })),
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
        },
      });
      console.log('[DEBUG] Chat session started');

      if (systemPrompt) {
        console.log('[DEBUG] Adding system prompt to history');
        await chat.sendMessage(systemPrompt);
      }

      console.log('[DEBUG] Sending user message to chat');
      result = await chat.sendMessage(prompt);
      console.log('[DEBUG] Received response from chat');
    } else {
      console.log('[DEBUG] Using single prompt mode');
      
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`
        : prompt;
      
      console.log('[DEBUG] Full prompt length:', fullPrompt.length);
      
      result = await model.generateContent(fullPrompt);
      console.log('[DEBUG] Received response from generateContent');
    }

    const response = result.response;
    console.log('[DEBUG] Extracted response object');
    
    const text = response.text();
    console.log('[DEBUG] Extracted text from response, length:', text.length);
    
    return text;
  } catch (error) {
    console.error('[DEBUG] Error in generateGeminiResponse:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again later.';
  }
}
