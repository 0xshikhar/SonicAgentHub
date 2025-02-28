-- Generated SQL for Supabase dashboard
-- Run this in the Supabase SQL Editor
-- 2025-03-02T12:35:37.947Z


-- Create the agent_chain_general_agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_chain_general_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('twitter', 'character')),
    profile_picture TEXT,
    twitter_handle TEXT,
    traits JSONB,
    background TEXT,
    system_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT REFERENCES public.agent_chain_end_users(id),
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

-- Create policy for users to select their own agents
CREATE POLICY select_own_agents ON public.agent_chain_general_agents
    FOR SELECT
    USING (created_by = auth.uid());

-- Create policy for users to insert their own agents
CREATE POLICY insert_own_agents ON public.agent_chain_general_agents
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Create policy for users to update their own agents
CREATE POLICY update_own_agents ON public.agent_chain_general_agents
    FOR UPDATE
    USING (created_by = auth.uid());

-- Create policy for users to delete their own agents
CREATE POLICY delete_own_agents ON public.agent_chain_general_agents
    FOR DELETE
    USING (created_by = auth.uid()); 
