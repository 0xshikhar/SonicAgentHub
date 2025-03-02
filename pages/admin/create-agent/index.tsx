import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default function AdminCreateAgentPage() {
  const [twitterHandle, setTwitterHandle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    profile?: any
  } | null>(null)

  async function handleCreateAgent() {
    if (!twitterHandle) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-onchain-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          adminAddress: ADMIN_WALLET_ADDRESS,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin: Create Onchain Agent</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Agent from Twitter Profile</CardTitle>
            <CardDescription>
              Enter a Twitter handle to create an AI agent based on that profile.
              This action will fetch the Twitter profile data, save it to the database,
              and create a wallet for the agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Twitter handle (without @)"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleCreateAgent} disabled={isLoading || !twitterHandle}>
                {isLoading ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mt-4 w-full">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
                
                {result.success && result.profile && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="font-medium mb-2">Profile Created:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Handle:</div>
                      <div className="font-medium">{result.profile.handle}</div>
                      
                      <div>Display Name:</div>
                      <div className="font-medium">{result.profile.display_name}</div>
                      
                      <div>Bio:</div>
                      <div className="font-medium">{result.profile.bio}</div>
                    </div>
                  </div>
                )}
              </Alert>
            )}
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  )
} 