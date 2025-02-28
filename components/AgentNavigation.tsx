import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export function AgentNavigation() {
  const router = useRouter();
  
  const isActive = (path: string) => router.pathname === path;
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link href="/agents" passHref>
        <Button
          variant={isActive("/agents") ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <span>Browse Agents</span>
        </Button>
      </Link>
      
      <Link href="/agents/create" passHref>
        <Button
          variant={isActive("/agents/create") ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <span>Create Agent</span>
        </Button>
      </Link>
      
      <Link href="/agents/chat" passHref>
        <Button
          variant={isActive("/agents/chat") ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <span>Chat with Agent</span>
        </Button>
      </Link>
    </div>
  );
} 