import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/AdminLayout"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

interface EnvVarStatus {
  name: string
  isSet: boolean
}

export default function AdminConfigPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [envVars, setEnvVars] = useState<EnvVarStatus[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkEnvironmentVariables() {
      try {
        const response = await fetch(`/api/admin/check-env?adminAddress=${ADMIN_WALLET_ADDRESS}`)
        
        if (!response.ok) {
          throw new Error(`Error checking environment variables: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.message || "Failed to check environment variables")
        }
        
        const envVarStatuses = Object.entries(data.envVars).map(([name, isSet]) => ({
          name,
          isSet: isSet as boolean
        }))
        
        setEnvVars(envVarStatuses)
      } catch (err) {
        console.error("Failed to check environment variables:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkEnvironmentVariables()
  }, [])

  // Group environment variables by category
  const groupedEnvVars = envVars.reduce<Record<string, typeof envVars>>((acc, envVar) => {
    const category = getEnvVarCategory(envVar.name)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(envVar)
    return acc
  }, {})

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin: Configuration</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading environment variables...</div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedEnvVars).map(([category, vars]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{formatCategoryName(category)}</CardTitle>
                  <CardDescription>
                    {getCategoryDescription(category)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {vars.map((envVar) => (
                      <li key={envVar.name} className="flex justify-between items-center">
                        <span className="font-mono text-sm">{envVar.name}</span>
                        <Badge variant={envVar.isSet ? "default" : "destructive"}>
                          {envVar.isSet ? "Available" : "Missing"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function getEnvVarCategory(name: string): string {
  if (name.includes("SUPABASE")) return "supabase"
  if (name.includes("RPC") || name.includes("PRIVATE_KEY")) return "blockchain"
  if (name.includes("SOCIAL_DATA") || name.includes("TWITTER")) return "social"
  if (name.includes("DISCORD")) return "notifications"
  return "other"
}

function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    supabase: "Supabase Database",
    blockchain: "Blockchain Configuration",
    social: "Social Media APIs",
    notifications: "Notification Services",
    other: "Other Configuration"
  }
  
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

function getCategoryDescription(category: string): string {
  const descriptionMap: Record<string, string> = {
    supabase: "Database connection and authentication settings",
    blockchain: "Blockchain RPC endpoints and wallet configuration",
    social: "API keys for Twitter and other social media platforms",
    notifications: "Discord webhook URLs and notification settings",
    other: "Miscellaneous configuration settings"
  }
  
  return descriptionMap[category] || ""
} 