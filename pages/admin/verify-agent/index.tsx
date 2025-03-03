import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

export default function AdminVerifyAgentPage() {
    const [twitterHandle, setTwitterHandle] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        message: string
        verificationResults?: any
        rawResponse?: any
    } | null>(null)

    async function handleVerifyAgent() {
        if (!twitterHandle) return

        setIsLoading(true)
        setResult(null)

        try {
            console.log(`Verifying agent data for handle: ${twitterHandle}`)
            const response = await fetch(`/api/admin/verify-agent-data?handle=${twitterHandle}&adminAddress=${ADMIN_WALLET_ADDRESS}`)
            const data = await response.json()

            console.log("Verification API response:", JSON.stringify(data, null, 2))

            setResult({
                success: data.success,
                message: data.message || (data.success ? "Verification completed" : "Verification failed"),
                verificationResults: {
                    userProfile: data.userExists,
                    twitterProfileData: data.twitterProfileExists,
                    savedTweets: data.savedTweetsCount,
                    tweetCollectionMetadata: data.tweetCollectionExists,
                    wallet: data.walletExists
                },
                rawResponse: data
            })
        } catch (error) {
            console.error("Error verifying agent:", error)
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "An unknown error occurred",
                rawResponse: { error: String(error) }
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-8">Admin: Verify Agent Data</h1>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Verify Agent Data</CardTitle>
                        <CardDescription>
                            Enter a Twitter handle to verify if all required data for that agent exists in the database.
                            This will check for user profile, Twitter data, tweets, and wallet information.
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
                            <Button onClick={handleVerifyAgent} disabled={isLoading || !twitterHandle}>
                                {isLoading ? "Verifying..." : "Verify Agent"}
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start">
                        {result && (
                            <Alert variant={result.success ? "default" : "destructive"} className="mt-4 w-full">
                                {result.success ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                                <AlertDescription>{result.message}</AlertDescription>

                                {result.verificationResults && (
                                    <div className="mt-4 p-4 bg-muted rounded-md">
                                        <h3 className="font-medium mb-2">Verification Results:</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>User Profile:</div>
                                            <div className="font-medium">
                                                {result.verificationResults.userProfile ? "✅ Found" : "❌ Not Found"}
                                            </div>

                                            <div>Twitter Profile Data:</div>
                                            <div className="font-medium">
                                                {result.verificationResults.twitterProfileData ? "✅ Found" : "❌ Not Found"}
                                            </div>

                                            <div>Saved Tweets:</div>
                                            <div className="font-medium">
                                                {result.verificationResults.savedTweets !== null
                                                    ? `${result.verificationResults.savedTweets} tweets found`
                                                    : "❌ Not Found"}
                                            </div>

                                            <div>Tweet Collection Metadata:</div>
                                            <div className="font-medium">
                                                {result.verificationResults.tweetCollectionMetadata ? "✅ Found" : "❌ Not Found"}
                                            </div>

                                            <div>Wallet:</div>
                                            <div className="font-medium">
                                                {result.verificationResults.wallet ? "✅ Found" : "❌ Not Found"}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 p-4 bg-muted rounded-md">
                                    <h3 className="font-medium mb-2">Raw API Response:</h3>
                                    <pre className="text-xs overflow-auto max-h-60 p-2 bg-gray-800 text-gray-200 rounded">
                                        {JSON.stringify(result.rawResponse, null, 2)}
                                    </pre>
                                </div>
                            </Alert>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AdminLayout>
    )
} 