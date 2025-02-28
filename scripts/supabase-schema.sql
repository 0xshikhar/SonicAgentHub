
-- This script will create the agent_chain_general_agents table
-- Run this in your Supabase SQL Editor

-- First, make sure we have the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists (CAUTION: This will delete all data in the table)
DROP TABLE IF EXISTS public.agent_chain_general_agents;

-- Create the agent_chain_general_agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_chain_general_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('twitter', 'character')),
    profile_picture TEXT,
    twitter_handle TEXT,
    traits TEXT,
    background TEXT,
    system_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT,
    is_public BOOLEAN DEFAULT TRUE
);

-- Add comment to the table
COMMENT ON TABLE public.agent_chain_general_agents IS 'Table for storing general AI agents';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_chain_general_agents_created_by ON public.agent_chain_general_agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_chain_general_agents_agent_type ON public.agent_chain_general_agents(agent_type);

-- Grant permissions
ALTER TABLE public.agent_chain_general_agents ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting public agents
CREATE POLICY select_public_agents ON public.agent_chain_general_agents
    FOR SELECT
    USING (is_public = TRUE);

-- Create policy for all operations (temporary solution)
CREATE POLICY allow_all_operations ON public.agent_chain_general_agents
    FOR ALL
    USING (true); 

-- Verify the table was created
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'agent_chain_general_agents'
);
