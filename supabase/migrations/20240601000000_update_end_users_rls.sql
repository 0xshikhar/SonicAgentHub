-- Update RLS policies for agent_chain_end_users table
-- This allows public access for inserting new end users

-- First, enable RLS on the table if not already enabled
ALTER TABLE agent_chain_end_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to agent_chain_end_users" ON agent_chain_end_users;
DROP POLICY IF EXISTS "Allow public insert access to agent_chain_end_users" ON agent_chain_end_users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own records" ON agent_chain_end_users;

-- Create a policy to allow anyone to read end users
CREATE POLICY "Allow public read access to agent_chain_end_users" 
ON agent_chain_end_users
FOR SELECT 
USING (true);

-- Create a policy to allow anyone to insert new end users
CREATE POLICY "Allow public insert access to agent_chain_end_users" 
ON agent_chain_end_users
FOR INSERT 
WITH CHECK (true);

-- Create a policy to allow authenticated users to update their own records
CREATE POLICY "Allow authenticated users to update their own records" 
ON agent_chain_end_users
FOR UPDATE 
USING (auth.uid()::text = address)
WITH CHECK (auth.uid()::text = address); 