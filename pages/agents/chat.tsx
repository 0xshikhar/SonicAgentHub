import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/toast";
import { agents } from "@/lib/constants";

interface Message {
  role: "user" | "agent";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { handle } = router.query;
  const [agentName, setAgentName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agent name when handle changes
  useEffect(() => {
    if (handle && typeof handle === "string") {
      fetchAgentName(handle);
    }
  }, [handle]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch agent name from API
  async function fetchAgentName(agentHandle: string) {
    try {
      const response = await axios.post("/api/agent-training", {
        action: "getAgents"
      });

      if (response.data.success) {
        const agent = response.data.data.find((a: any) => a.id === agentHandle);
        if (agent) {
          setAgentName(agent.name);
          // Add welcome message
          setMessages([
            {
              role: "agent",
              content: `Hello! I'm ${agent.name}. How can I assist you today?`
            }
          ]);
        } else {
          showToast.error(`Agent with handle ${agentHandle} not found`);
        }
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
      showToast.error("Failed to fetch agent information");
    }
  }

  // Send message to agent
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || !handle) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/agent-training", {
        action: "generateResponse",
        handle,
        prompt: userMessage
      });
      
      if (response.data.success) {
        // Add agent response to chat
        setMessages((prev) => [
          ...prev,
          { role: "agent", content: response.data.data.response }
        ]);
      } else {
        showToast.error(response.data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showToast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }

  // Scroll to bottom of messages
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {agentName ? `Chat with ${agentName}` : "Agent Chat"}
        </h1>
        <Button variant="outline" onClick={() => router.push("/agents")}>
          Back to Agents
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !handle && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="mb-2">Select an agent to start chatting</p>
            <Button onClick={() => router.push("/agents")}>
              Browse Agents
            </Button>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || !handle}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !handle || !input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
} 