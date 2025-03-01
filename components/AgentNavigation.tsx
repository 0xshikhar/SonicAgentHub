import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export function AgentNavigation() {
    const router = useRouter();

    const isActive = (path: string) => {
        return router.pathname === path;
    };

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Link href="/agents" passHref>
                <Button
                    variant={isActive("/agents") ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                    <span>Discover</span>
                </Button>
            </Link>

            <Link href="/agents/create" passHref>
                <Button
                    variant={isActive("/agents/create") ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    <span>Create Agent</span>
                </Button>
            </Link>

            {/* <Link href="/agents/my-agents" passHref>
                <Button
                    variant={isActive("/agents/my-agents") ? "default" : "outline"}
                    className="flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span>My Agents</span>
                </Button>
            </Link> */}
        </div>
    );
} 