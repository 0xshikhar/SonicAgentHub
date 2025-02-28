import { useState, useRef, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { AgentNavigation } from "@/components/AgentNavigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AgentChatPage: NextPage = () => {
  const [handle, setHandle] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!handle.trim()) {
      showToast.error("Please enter an agent handle");
      return;
    }
    
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/agent-training", {
        action: "generateResponse",
        handle: handle.trim(),
        prompt: userMessage,
      });
      
      // Add agent response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.data.response },
      ]);
    } catch (error: unknown) {
      console.error("Error generating response:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : axios.isAxiosError(error) && error.response?.data?.error 
          ? error.response.data.error 
          : "Failed to generate response";
          
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Chat with AI Agent | Agent Chain</title>
        <meta
          name="description"
          content="Chat with an AI agent trained on Twitter profiles"
        />
      </Head>
      
      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Chat with AI Agent</h1>
        <AgentNavigation />
        
        <div className="flex flex-col h-[calc(100vh-180px)]">
          <div className="mb-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter agent handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="max-w-xs"
              />
              <Button 
                variant="outline" 
                onClick={() => setMessages([])}
                disabled={messages.length === 0}
              >
                Clear Chat
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-background">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <p>Enter an agent handle and start chatting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !handle.trim()}
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !handle.trim()}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
};

export default AgentChatPage; 