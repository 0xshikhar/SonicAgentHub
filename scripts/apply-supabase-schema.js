// This script applies the SQL schema to Supabase
// Run with: bun scripts/apply-supabase-schema.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

// We need to use the service role key to run SQL commands
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySqlSchema() {
    try {
        const sqlFilePath = path.join(process.cwd(), 'scripts', 'create-general-agents-table.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Applying SQL schema to Supabase...');

        // Split the SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            const { data, error } = await supabase.rpc('pgmoon_exec', { query: statement });

            if (error) {
                console.error(`Error executing statement ${i + 1}:`, error.message);
                console.error('Statement:', statement);

                // Try alternative approach if pgmoon_exec is not available
                console.log('Trying alternative approach...');
                const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: statement });

                if (rpcError) {
                    console.error('Alternative approach failed:', rpcError.message);

                    // If both approaches fail, try to execute the entire script at once
                    if (i === 0) {
                        console.log('Trying to execute entire script at once...');
                        const { error: fullError } = await supabase.rpc('pgmoon_exec', { query: sqlContent });

                        if (fullError) {
                            console.error('Failed to execute entire script:', fullError.message);
                            console.error('You may need to run this SQL in the Supabase dashboard SQL editor.');
                            console.log('\nSQL to run in Supabase dashboard:');
                            console.log(sqlContent);
                            return false;
                        } else {
                            console.log('✅ Successfully executed entire script');
                            return true;
                        }
                    }
                } else {
                    console.log(`✅ Successfully executed statement ${i + 1} with alternative approach`);
                }
            } else {
                console.log(`✅ Successfully executed statement ${i + 1}`);
            }
        }

        console.log('✅ Successfully applied SQL schema to Supabase');
        return true;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error applying SQL schema:', error.message);
        return false;
    }
}

async function verifyTableExists() {
    try {
        console.log('\nVerifying agent_chain_general_agents table exists...');
        const { data, error } = await supabase
            .from('agent_chain_general_agents')
            .select('count');

        if (error) {
            console.error('Error verifying table exists:', error.message);
            return false;
        }

        console.log('✅ Table agent_chain_general_agents exists and is accessible');
        return true;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error verifying table exists:', error.message);
        return false;
    }
}

async function main() {
    const success = await applySqlSchema();

    if (success) {
        await verifyTableExists();
    }
}

main().catch(err => {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unhandled error:', error.message);
}); 