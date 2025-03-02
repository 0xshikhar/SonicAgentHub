import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useAccount } from 'wagmi'
import { showToast } from '@/lib/toast'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Admin wallet address for authorization
const ADMIN_WALLET_ADDRESS = "0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5"

// Form schema for admin agent creation
const adminAgentFormSchema = z.object({
    twitterHandle: z.string().min(1, {
        message: "Twitter handle is required",
    }),
})

type AdminAgentFormValues = z.infer<typeof adminAgentFormSchema>

function AdminAgentCreator() {
    const [isLoading, setIsLoading] = useState(false)
    const [creationResults, setCreationResults] = useState<Array<{ handle: string; success: boolean; message: string }>>([])
    const { address } = useAccount()

    // Check if current user is admin
    const isAdmin = address && address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()

    // Admin form
    const adminForm = useForm<AdminAgentFormValues>({
        resolver: zodResolver(adminAgentFormSchema),
        defaultValues: {
            twitterHandle: "",
        },
    })

    async function onAdminSubmit(data: AdminAgentFormValues) {
        if (!isAdmin) {
            showToast.error("Unauthorized: Admin wallet address required")
            return
        }

        setIsLoading(true)
        try {
            // Clean the Twitter handle (remove @ if present)
            const handle = data.twitterHandle.replace('@', '').trim()

            // Update UI to show current handle being processed
            setCreationResults([{ handle, success: false, message: "Processing..." }])

            // Get the base URL with window check
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            console.log(`Creating onchain agent using admin API endpoint: ${baseUrl}/api/admin/create-onchain-agent`)

            // Call our admin API endpoint
            const response = await axios.post(`${baseUrl}/api/admin/create-onchain-agent`, {
                handle,
                adminAddress: address
            })

            if (response.data.success) {
                showToast.success(`Onchain agent created from Twitter profile: @${handle}`)
                setCreationResults([{ handle, success: true, message: "Created successfully!" }])
                adminForm.reset()
            } else {
                showToast.error(response.data.error || "Failed to create onchain agent")
                setCreationResults([{ handle, success: false, message: response.data.error || "Failed to create agent" }])
            }
        } catch (error: unknown) {
            console.error("Error creating onchain agent:", error)
            const errorMessage = error instanceof Error
                ? error.message
                : axios.isAxiosError(error) && error.response?.data?.error
                    ? error.response.data.error
                    : "Failed to create onchain agent"

            showToast.error(errorMessage)
            setCreationResults([{
                handle: data.twitterHandle,
                success: false,
                message: errorMessage
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // If not admin, don't render the component
    if (!isAdmin) {
        return null
    }

    return (
        <Card className="bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] border border-white/5 shadow-lg">
            <CardHeader>
                <Badge variant="outline" className="self-start mb-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">
                    Admin Only
                </Badge>
                <CardTitle className="text-white">Create Onchain Twitter Agent</CardTitle>
                <CardDescription className="text-gray-400">
                    Admin tool to create onchain agents from Twitter profiles. These agents will be stored in the agent_chain_users database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                        <FormField
                            control={adminForm.control}
                            name="twitterHandle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Twitter Handle</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="@username"
                                            {...field}
                                            className="bg-[#131B31] border-white/10 text-white"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-gray-400">
                                        Enter a Twitter handle to create an onchain agent based on their profile
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Onchain Agent..." : "Create Onchain Agent"}
                        </Button>
                    </form>
                </Form>

                {/* Creation Results */}
                {creationResults.length > 0 && (
                    <div className="mt-6">
                        <Separator className="bg-white/10 mb-4" />
                        <h3 className="text-white font-semibold mb-2">Creation Results:</h3>
                        <div className="space-y-2">
                            {creationResults.map((result, index) => (
                                <div key={index} className="flex items-center">
                                    <span className="text-gray-300 w-24">@{result.handle}:</span>
                                    <span className={`ml-2 ${result.success
                                            ? 'text-green-400'
                                            : result.message === 'Processing...'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }`}>
                                        {result.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export { AdminAgentCreator } 