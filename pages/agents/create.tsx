import { NextPage } from "next";
import Head from "next/head";
import { AgentTrainingForm } from "@/components/AgentTrainingForm";
import { AgentNavigation } from "@/components/AgentNavigation";

const CreateAgentPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create AI Agent | Agent Chain</title>
        <meta
          name="description"
          content="Create an AI agent based on a Twitter profile or custom character"
        />
      </Head>
      
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Create AI Agent</h1>
        <AgentNavigation />
        <AgentTrainingForm />
      </main>
    </>
  );
};

export default CreateAgentPage; 