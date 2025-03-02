import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, CheckCircle, Settings } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminDashboardPage() {
    return (
        <AdminLayout>
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <div className="text-sm text-muted-foreground">
                        Admin Wallet: <code className="bg-muted px-1 py-0.5 rounded">0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5</code>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Agent</CardTitle>
                            <CardDescription>
                                Create a new AI agent based on a Twitter profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This will fetch Twitter profile data, save it to the database, and create a wallet for the agent.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/admin/create-agent">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Agent
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verify Agent Data</CardTitle>
                            <CardDescription>
                                Check if all required data for an agent exists
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Verify that user profile, Twitter data, tweets, and wallet information are all present in the database.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/verify-agent">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify Agent
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>
                                View and update system configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Check environment variables, API keys, and other system settings.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/config">
                                    <Settings className="mr-2 h-4 w-4" />
                                    View Configuration
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-md">
                    <h2 className="text-lg font-medium mb-2">Quick Start</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Use the <strong>Create Agent</strong> page to create a new AI agent from a Twitter profile</li>
                        <li>Use the <strong>Verify Agent</strong> page to check if all required data exists</li>
                        <li>For more detailed instructions, refer to the <code>README-ADMIN.md</code> file</li>
                    </ol>
                </div>
            </div>
        </AdminLayout>
    )
} 