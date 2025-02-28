# Supabase Migrations

This directory contains SQL migrations for the Supabase database.

## Running Migrations

To apply the migrations, you can use one of the following methods:

### Method 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file you want to run
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL

### Method 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

## Fixing RLS Policy Issues

If you're encountering RLS (Row Level Security) policy errors when inserting data into the `agent_chain_end_users` table, you need to run the `20240601000000_update_end_users_rls.sql` migration.

This migration:
1. Enables RLS on the `agent_chain_end_users` table
2. Creates policies to allow public read and insert access
3. Creates a policy to allow authenticated users to update their own records

After applying this migration, the wallet connection functionality should work properly without RLS errors. 