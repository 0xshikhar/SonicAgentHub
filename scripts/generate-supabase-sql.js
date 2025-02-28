#!/usr/bin/env bun

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create-general-agents-table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Generate the complete SQL script
const completeSql = `
-- This script will create the agent_chain_general_agents table
-- Run this in your Supabase SQL Editor

-- First, make sure we have the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists (CAUTION: This will delete all data in the table)
DROP TABLE IF EXISTS public.agent_chain_general_agents;

${sqlContent}

-- Verify the table was created
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'agent_chain_general_agents'
);
`;

// Write the complete SQL to a file
const outputPath = path.join(__dirname, 'supabase-schema.sql');
fs.writeFileSync(outputPath, completeSql);

console.log(`Complete SQL schema generated at: ${outputPath}`);
console.log('');
console.log('To apply this schema:');
console.log('1. Copy the contents of the generated file');
console.log('2. Go to the Supabase SQL Editor');
console.log('3. Create a new query, paste the SQL, and run it');
console.log('');
console.log('To verify the table exists:');
console.log('bun scripts/check-supabase.js'); 