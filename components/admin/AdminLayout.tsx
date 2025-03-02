import Link from "next/link"
import { useRouter } from "next/router"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

function AdminNavigation() {
  const router = useRouter()
  
  const getCurrentTab = () => {
    const path = router.pathname
    if (path.includes("/admin/create-agent")) return "create-agent"
    if (path.includes("/admin/verify-agent")) return "verify-agent"
    if (path.includes("/admin/config")) return "config"
    return "dashboard"
  }

  return (
    <nav>
      <Tabs value={getCurrentTab()} className="w-full">
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="dashboard" asChild>
            <Link href="/admin">Dashboard</Link>
          </TabsTrigger>
          <TabsTrigger value="create-agent" asChild>
            <Link href="/admin/create-agent">Create Agent</Link>
          </TabsTrigger>
          <TabsTrigger value="verify-agent" asChild>
            <Link href="/admin/verify-agent">Verify Agent</Link>
          </TabsTrigger>
          <TabsTrigger value="config" asChild>
            <Link href="/admin/config">Config</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </nav>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Agent Chain Admin</h1>
            <AdminNavigation />
          </div>
        </div>
      </header>
      
      <main className="bg-white min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
} 