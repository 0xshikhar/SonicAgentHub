import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { showToast } from "@/lib/toast";
import { AgentNavigation } from "@/components/AgentNavigation"

// Twitter profile form schema
const twitterFormSchema = z.object({
  twitterHandle: z.string().min(1, {
    message: "Twitter handle is required",
  }),
});

// Character profile form schema
const characterFormSchema = z.object({
  handle: z.string().min(1, {
    message: "Handle is required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  traits: z.string().optional(),
  background: z.string().optional(),
});

// Onchain agent request form schema
const onchainFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  agentType: z.string().min(1, {
    message: "Agent type is required",
  }),
  details: z.string().min(10, {
    message: "Please provide more details about your agent (minimum 10 characters)",
  }),
});

type TwitterFormValues = z.infer<typeof twitterFormSchema>;
type CharacterFormValues = z.infer<typeof characterFormSchema>;
type OnchainFormValues = z.infer<typeof onchainFormSchema>;

// List of test Twitter handles for quick testing
const testHandles = [
  'elonmusk',
  'vitalikbuterin',
  'naval',
  'balajis',
  'jack'
];

const CreateAgentPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("twitter");
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [testResults, setTestResults] = useState<Array<{handle: string; success: boolean; message: string}>>([]);
  const { address } = useAccount();

  // Twitter form
  const twitterForm = useForm<TwitterFormValues>({
    resolver: zodResolver(twitterFormSchema),
    defaultValues: {
      twitterHandle: "",
    },
  });

  // Character form
  const characterForm = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      handle: "",
      name: "",
      description: "",
      traits: "",
      background: "",
    },
  });

  // Onchain form
  const onchainForm = useForm<OnchainFormValues>({
    resolver: zodResolver(onchainFormSchema),
    defaultValues: {
      email: "",
      agentType: "twitter",
      details: "",
    },
  });

  async function onTwitterSubmit(data: TwitterFormValues) {
    setIsLoading(true);
    try {
      // Clean the Twitter handle (remove @ if present)
      const handle = data.twitterHandle.replace('@', '').trim();

      // Get the base URL with window check
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Creating Twitter agent using API endpoint: ${baseUrl}/api/users/create`);

      // Call our new API endpoint
      const response = await axios.post(`${baseUrl}/api/users/create`, {
        handle
      });

      if (response.data.success) {
        showToast.success(`Agent created from Twitter profile: @${handle}`);

        // Redirect to agents listing page
        router.push('/agents');
      } else {
        showToast.error(response.data.error || "Failed to create agent");
        twitterForm.reset();
      }
    } catch (error: unknown) {
      console.error("Error creating agent from Twitter:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to create agent";

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function onCharacterSubmit(data: CharacterFormValues) {
    setIsLoading(true);
    try {
      // Get the base URL from the current window location
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Using API endpoint: ${baseUrl}/api/agent-training for character agent creation`);
      
      const response = await axios.post(`${baseUrl}/api/agent-training`, {
        action: "createFromCharacter",
        handle: data.handle,
        name: data.name,
        description: data.description,
        traits: data.traits ? data.traits.split(",").map(t => t.trim()) : [],
        background: data.background || "",
        createdBy: address,
      });

      showToast.success(`Agent created from character profile: ${data.name}`);

      // Redirect to agents listing page
      router.push('/agents');
    } catch (error: unknown) {
      console.error("Error creating agent from character:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to create agent";

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function onOnchainSubmit(data: OnchainFormValues) {
    setIsLoading(true);
    try {
      // Get the base URL from the current window location
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Using API endpoint: ${baseUrl}/api/agent-training for onchain agent request`);
      
      const response = await axios.post(`${baseUrl}/api/agent-training`, {
        action: "createOnchainAgentRequest",
        email: data.email,
        walletAddress: address,
        agentType: data.agentType,
        details: data.details,
      });

      if (response.data.success) {
        showToast.success("Your onchain agent request has been submitted successfully!");
        onchainForm.reset();
        
        // Redirect to agents listing page
        router.push('/agents');
      }
    } catch (error: unknown) {
      console.error("Error submitting onchain agent request:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to submit request";

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to create a single test agent with detailed logging
  async function createSingleTestAgent(handle: string) {
    try {
      console.log(`Creating agent for @${handle}...`);
      showToast.info(`Creating agent for @${handle}...`);
      
      // Get the base URL from the current window location
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Using API endpoint: ${baseUrl}/api/users/create`);
      
      // Make the API request
      const response = await axios.post(`${baseUrl}/api/users/create`, { handle });
      console.log(`API response for @${handle}:`, response.data);
      
      if (response.data.success) {
        console.log(`Successfully created agent for @${handle}:`, response.data);
        showToast.success(`Successfully created agent for @${handle}`);
        return true;
      } else {
        console.error(`Failed to create agent for @${handle}:`, response.data.error);
        showToast.error(`Failed to create agent for @${handle}: ${response.data.error || "Unknown error"}`);
        return false;
      }
    } catch (error: unknown) {
      console.error(`Error creating agent for @${handle}:`, error);
      
      const errorMessage = error instanceof Error
        ? error.message
        : axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to create agent";
      
      showToast.error(`Error creating agent for @${handle}: ${errorMessage}`);
      return false;
    }
  }

  // Function to create test agents
  async function createTestAgents() {
    setTestingInProgress(true);
    setTestResults([]);
    
    const results = [];
    
    for (const handle of testHandles) {
      try {
        // Update UI to show current handle being processed
        setTestResults(prev => [...prev, { handle, success: false, message: "Processing..." }]);
        
        // Use the single test agent function
        const success = await createSingleTestAgent(handle);
        
        if (success) {
          // Update results with success
          setTestResults(prev => 
            prev.map(item => 
              item.handle === handle 
                ? { handle, success: true, message: "Created successfully!" } 
                : item
            )
          );
          results.push({ handle, success: true, message: "Created successfully!" });
        } else {
          // Update results with error
          setTestResults(prev => 
            prev.map(item => 
              item.handle === handle 
                ? { handle, success: false, message: "Failed to create agent" } 
                : item
            )
          );
          results.push({ handle, success: false, message: "Failed to create agent" });
        }
      } catch (error: unknown) {
        console.error(`Error in createTestAgents for @${handle}:`, error);
        
        // Update results with error
        setTestResults(prev => 
          prev.map(item => 
            item.handle === handle 
              ? { handle, success: false, message: "Error creating agent" } 
              : item
          )
        );
        results.push({ handle, success: false, message: "Error creating agent" });
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTestingInProgress(false);
  }

  return (
    <>
      <Head>
        <title>Create AI Agent | Agent Chain</title>
        <meta
          name="description"
          content="Create an AI agent based on a Twitter profile, custom character, or request an onchain agent"
        />
      </Head>

      <div className="min-h-screen bg-[#0A0E1A]">
        {/* Header with cosmic background */}
        <div className="relative border-b border-white/5">
          {/* Cosmic Background with Stars */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              {/* Simulated stars using pseudo-elements in the background */}
              <div className="absolute h-1 w-1 rounded-full bg-white top-[10%] left-[15%] animate-pulse"></div>
              <div className="absolute h-1 w-1 rounded-full bg-white top-[25%] left-[40%] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute h-1 w-1 rounded-full bg-white top-[15%] left-[65%] animate-pulse" style={{ animationDelay: '1.2s' }}></div>
              <div className="absolute h-1 w-1 rounded-full bg-white top-[45%] left-[85%] animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute h-1 w-1 rounded-full bg-white top-[65%] left-[25%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute h-2 w-2 rounded-full bg-blue-400 top-[30%] left-[75%] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute h-2 w-2 rounded-full bg-purple-400 top-[70%] left-[60%] animate-pulse" style={{ animationDelay: '1.8s' }}></div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              Create AI Agent
            </h1>

            <p className="text-gray-300 text-lg mb-8 max-w-2xl">
              Create an AI agent that can interact with users, post tweets, and even trade on the blockchain
            </p>

            <div className="flex items-center justify-between">
              <AgentNavigation />
              
              {/* Test Button */}
              <div className="ml-4">
                <Button
                  onClick={createTestAgents}
                  disabled={testingInProgress}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {testingInProgress ? "Creating Test Agents..." : "Create Test Agents"}
                </Button>
              </div>
            </div>
            
            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mt-4 p-4 bg-[#131B31] border border-white/10 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Test Results:</h3>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-300 w-24">@{result.handle}:</span>
                      <span className={`ml-2 ${result.success ? 'text-green-400' : result.message === 'Processing...' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Individual Test Buttons */}
            <div className="mt-4 p-4 bg-[#131B31] border border-white/10 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Test Individual Agents:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {testHandles.map((handle) => (
                  <Button
                    key={handle}
                    onClick={() => createSingleTestAgent(handle)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    @{handle}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs
                defaultValue="twitter"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-[#131B31] border border-white/10 p-1">
                  <TabsTrigger
                    value="twitter"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                    Twitter
                  </TabsTrigger>
                  <TabsTrigger
                    value="character"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Character
                  </TabsTrigger>
                  <TabsTrigger
                    value="onchain"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                    Onchain
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="twitter" className="mt-6">
                  <Card className="bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] border border-white/5 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Create Twitter-based Agent</CardTitle>
                      <CardDescription className="text-gray-400">
                        Create an AI agent based on a Twitter profile. The agent will analyze the profile and tweets to mimic the communication style.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...twitterForm}>
                        <form onSubmit={twitterForm.handleSubmit(onTwitterSubmit)} className="space-y-6">
                          <FormField
                            control={twitterForm.control}
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
                                  Enter a Twitter handle to create an AI agent based on their profile and tweets
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
                            {isLoading ? "Creating Agent..." : "Create Twitter Agent"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="character" className="mt-6">
                  <Card className="bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] border border-white/5 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Create Character-based Agent</CardTitle>
                      <CardDescription className="text-gray-400">
                        Create a custom AI agent with a unique personality, traits, and background.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...characterForm}>
                        <form onSubmit={characterForm.handleSubmit(onCharacterSubmit)} className="space-y-6">
                          <FormField
                            control={characterForm.control}
                            name="handle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Handle</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="unique-handle"
                                    {...field}
                                    className="bg-[#131B31] border-white/10 text-white"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  A unique identifier for this character
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={characterForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Character Name"
                                    {...field}
                                    className="bg-[#131B31] border-white/10 text-white"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  The display name for this character
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={characterForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="A brief description of the character"
                                    className="min-h-24 bg-[#131B31] border-white/10 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Describe the character's personality and background
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={characterForm.control}
                            name="traits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Traits</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="intelligent, curious, ambitious"
                                    {...field}
                                    className="bg-[#131B31] border-white/10 text-white"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Comma-separated list of character traits
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={characterForm.control}
                            name="background"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Background</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Additional background information about the character"
                                    className="min-h-24 bg-[#131B31] border-white/10 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Optional background story or additional context
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
                            {isLoading ? "Creating Agent..." : "Create Character Agent"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="onchain" className="mt-6">
                  <Card className="bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] border border-white/5 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Request Onchain Agent</CardTitle>
                      <CardDescription className="text-gray-400">
                        Request a custom onchain agent that can interact with blockchain networks and execute transactions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...onchainForm}>
                        <form onSubmit={onchainForm.handleSubmit(onOnchainSubmit)} className="space-y-6">
                          <FormField
                            control={onchainForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="your@email.com"
                                    type="email"
                                    {...field}
                                    className="bg-[#131B31] border-white/10 text-white"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  We'll use this to contact you about your agent request
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={onchainForm.control}
                            name="agentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Agent Type</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-[#131B31] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="twitter">Twitter-based Onchain Agent</option>
                                    <option value="trading">Trading Agent</option>
                                    <option value="defi">DeFi Agent</option>
                                    <option value="nft">NFT Agent</option>
                                    <option value="custom">Custom Agent</option>
                                  </select>
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Select the type of onchain agent you want to create
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={onchainForm.control}
                            name="details"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Details</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please describe what you want your agent to do, which blockchain networks it should interact with, and any specific functionality you need."
                                    className="min-h-32 bg-[#131B31] border-white/10 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Provide as much detail as possible about your desired agent functionality
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
                            {isLoading ? "Submitting Request..." : "Submit Onchain Agent Request"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:col-span-1">
              <Card className="h-full bg-gradient-to-b from-[#0B1628] via-[#0D1425] to-[#0B1628] border border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Agent Types</CardTitle>
                  <CardDescription className="text-gray-400">
                    Learn about the different types of agents you can create
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">Twitter</Badge>
                      <h3 className="font-semibold text-white">Twitter-based Agent</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Create an AI agent based on a Twitter profile. The agent will analyze tweets and mimic the communication style.
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30">Character</Badge>
                      <h3 className="font-semibold text-white">Character-based Agent</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Create a custom AI agent with a unique personality, traits, and background of your design.
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30">Onchain</Badge>
                      <h3 className="font-semibold text-white">Onchain Agent</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Request a custom onchain agent that can interact with blockchain networks, execute transactions, and trade on your behalf.
                    </p>
                    <ul className="text-sm text-gray-400 list-disc list-inside mt-2">
                      <li>Interact with smart contracts</li>
                      <li>Execute trades automatically</li>
                      <li>Monitor blockchain activity</li>
                      <li>Manage digital assets</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAgentPage; 