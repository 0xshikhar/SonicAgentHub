"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
import { showToast } from "@/lib/toast";

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

type TwitterFormValues = z.infer<typeof twitterFormSchema>;
type CharacterFormValues = z.infer<typeof characterFormSchema>;

export function AgentTrainingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("twitter");

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

  async function onTwitterSubmit(data: TwitterFormValues) {
    setIsLoading(true);
    try {
      // Get the base URL with window check
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Creating Twitter agent using API endpoint: ${baseUrl}/api/agent-training`);
      
      const response = await axios.post(`${baseUrl}/api/agent-training`, {
        action: "createFromTwitter",
        twitterHandle: data.twitterHandle,
      });

      showToast.success(`Agent created from Twitter profile: ${data.twitterHandle}`);
      
      // Redirect to agents listing page
      router.push('/agents');
      
      // Reset loading state
      setIsLoading(false);
    } catch (error: unknown) {
      console.error("Error creating agent from Twitter:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : axios.isAxiosError(error) && error.response?.data?.error 
          ? error.response.data.error 
          : "Failed to create agent";
          
      showToast.error(errorMessage);
      setIsLoading(false);
    }
  }

  async function onCharacterSubmit(data: CharacterFormValues) {
    setIsLoading(true);
    try {
      // Get the base URL with window check
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log(`Creating character agent using API endpoint: ${baseUrl}/api/agent-training`);
      
      const response = await axios.post(`${baseUrl}/api/agent-training`, {
        action: "createFromCharacter",
        handle: data.handle,
        name: data.name,
        description: data.description,
        traits: data.traits ? data.traits.split(",").map(t => t.trim()) : [],
        background: data.background || "",
      });

      showToast.success(`Agent created from character profile: ${data.name}`);
      
      // Redirect to agents listing page
      router.push('/agents');
      
      // Reset loading state
      setIsLoading(false);
    } catch (error: unknown) {
      console.error("Error creating agent from character:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : axios.isAxiosError(error) && error.response?.data?.error 
          ? error.response.data.error 
          : "Failed to create agent";
          
      showToast.error(errorMessage);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create AI Agent</h1>
        <p className="text-muted-foreground">
          Create an AI agent based on a Twitter profile or custom character
        </p>
      </div>

      <Tabs defaultValue="twitter" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="twitter">Twitter Profile</TabsTrigger>
          <TabsTrigger value="character">Custom Character</TabsTrigger>
        </TabsList>

        <TabsContent value="twitter" className="space-y-4 mt-4">
          <Form {...twitterForm}>
            <form onSubmit={twitterForm.handleSubmit(onTwitterSubmit)} className="space-y-4">
              <FormField
                control={twitterForm.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a Twitter handle to create an AI agent based on their profile and tweets
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Agent..." : "Create Twitter Agent"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="character" className="space-y-4 mt-4">
          <Form {...characterForm}>
            <form onSubmit={characterForm.handleSubmit(onCharacterSubmit)} className="space-y-4">
              <FormField
                control={characterForm.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="unique-handle" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this character
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={characterForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Character Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name for this character
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={characterForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of the character"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the character's personality and background
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={characterForm.control}
                name="traits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traits</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="intelligent, curious, ambitious"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of character traits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={characterForm.control}
                name="background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Character's history and background story"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional context about the character's history
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Agent..." : "Create Character Agent"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 