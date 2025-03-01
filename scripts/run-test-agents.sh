#!/bin/bash

# Ensure the script exits on any error
set -e

echo "🚀 Running Twitter agent creation test script..."
echo "📊 This will create test agents for: elonmusk, vitalikbuterin, naval, balajis, jack"
echo "⏳ Starting in 3 seconds..."
sleep 3

# Run the TypeScript script using Bun
echo "🏃 Executing test script with Bun..."
bun run scripts/create-test-agents.ts

echo "✅ Test script completed!"
echo "🔍 Check your Supabase dashboard to verify the agents were created successfully."
echo "🌐 You can view the agents at: http://localhost:3000/agents" 