#!/bin/bash

# Ensure the script exits on any error
set -e

echo "🚀 Running static agents migration script..."
echo "📊 This will migrate all static agents from constants.ts to the database"
echo "⏳ Starting in 3 seconds..."
sleep 3

# Run the TypeScript script using Bun
echo "🏃 Executing migration script with Bun..."
bun run scripts/migrate-static-agents.ts

echo "✅ Migration script completed!"
echo "🔍 Check your Supabase dashboard to verify the agents were created successfully."
echo "🌐 You can view the agents at: http://localhost:3000/agents" 