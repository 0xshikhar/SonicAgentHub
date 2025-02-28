# Supabase Setup Guide

This guide will help you set up the required tables in your Supabase database for the Agent Market platform.

## Issue: Missing `agent_chain_general_agents` Table

If you're encountering a 500 error when creating agents, it's likely because the `agent_chain_general_agents` table doesn't exist in your Supabase database. This table is required for storing general AI agents.

## Solution: Create the Missing Table

### Option 1: Using the Supabase Dashboard (Recommended)

1. Run `bun scripts/generate-supabase-sql.js` to generate the SQL script
2. Copy the contents of the `scripts/supabase-schema.sql` file that was generated
3. Go to the [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
4. Create a new query
5. Paste the SQL code
6. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
supabase db push
```

## Verifying the Setup

After creating the table, you can verify that it exists by running:

```bash
bun scripts/check-supabase.js
```

You should see a success message indicating that the table exists.

To test all CRUD operations on the table, run:

```bash
bun scripts/test-general-agents.js
```

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For advanced operations (like running migrations), you'll also need:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase project settings under "API".

## Troubleshooting

If you're still encountering issues after creating the table:

1. Check the Supabase logs for any errors
2. Verify that the table structure matches the expected schema
3. Ensure your application has the correct permissions to access the table
4. Check that your environment variables are correctly set

## Database Schema

The `agent_chain_general_agents` table has the following structure:

```sql
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
```

This table stores information about general AI agents, including their name, description, type, and other attributes. Note that the `created_by` column is of type `BIGINT` and is intended to store the ID of the user who created the agent. The foreign key constraint has been removed for simplicity, but you can add it later directly in the Supabase dashboard if needed.

### Row Level Security (RLS) Policies

The table has the following simplified RLS policies:

```sql
-- Create policy for selecting public agents
CREATE POLICY select_public_agents ON public.agent_chain_general_agents
    FOR SELECT
    USING (is_public = TRUE);

-- Create policy for all operations (temporary solution)
CREATE POLICY allow_all_operations ON public.agent_chain_general_agents
    FOR ALL
    USING (true);
```

We've simplified the RLS policies to avoid type casting issues between UUID and BIGINT. The `allow_all_operations` policy is a temporary solution that allows all operations on the table. You can implement more restrictive policies later if needed. 