import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AgentTestPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [generalAgents, setGeneralAgents] = useState<any[]>([]);
  const [ilblackdragonUser, setIlblackdragonUser] = useState<any>(null);
  const [ilblackdragonAgent, setIlblackdragonAgent] = useState<any>(null);
  const [directFetchResult, setDirectFetchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch users from agent_chain_users
        const usersResponse = await fetch('/api/debug/list-users');
        const usersData = await usersResponse.json();
        
        if (!usersData.success) {
          throw new Error(`Failed to fetch users: ${usersData.error}`);
        }
        
        setUsers(usersData.data || []);
        setIlblackdragonUser(usersData.ilblackdragon);
        
        // Fetch agents from agent_chain_general_agents
        const agentsResponse = await fetch('/api/debug/list-general-agents');
        const agentsData = await agentsResponse.json();
        
        if (!agentsData.success) {
          throw new Error(`Failed to fetch general agents: ${agentsData.error}`);
        }
        
        setGeneralAgents(agentsData.data || []);
        setIlblackdragonAgent(agentsData.ilblackdragon);
        
        // Direct fetch test using Supabase client
        await testDirectFetch();
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  async function testDirectFetch() {
    try {

      console.log('Testing direct fetch for ilblackdragon');
      
      // Test 1: Fetch from agent_chain_users with .single()
      const test1 = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('handle', 'ilblackdragon')
        .single();
      
      // Test 2: Fetch from agent_chain_users without .single()
      const test2 = await supabase
        .from('agent_chain_users')
        .select('*')
        .eq('handle', 'ilblackdragon');
      
      // Test 3: Fetch from agent_chain_general_agents with .single()
      const test3 = await supabase
        .from('agent_chain_general_agents')
        .select('*')
        .eq('handle', 'ilblackdragon')
        .single();
      
      // Test 4: Fetch from agent_chain_general_agents without .single()
      const test4 = await supabase
        .from('agent_chain_general_agents')
        .select('*')
        .eq('handle', 'ilblackdragon');
      
      setDirectFetchResult({
        test1: {
          data: test1.data,
          error: test1.error ? { message: test1.error.message, code: test1.error.code } : null
        },
        test2: {
          data: test2.data,
          error: test2.error ? { message: test2.error.message, code: test2.error.code } : null,
          count: test2.data?.length || 0
        },
        test3: {
          data: test3.data,
          error: test3.error ? { message: test3.error.message, code: test3.error.code } : null
        },
        test4: {
          data: test4.data,
          error: test4.error ? { message: test4.error.message, code: test4.error.code } : null,
          count: test4.data?.length || 0
        }
      });
    } catch (err: any) {
      console.error('Error in direct fetch test:', err);
      setDirectFetchResult({ error: err.message || 'An unknown error occurred' });
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Agent Database Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-xl">Loading...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">agent_chain_users Table</h2>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p><strong>Total users:</strong> {users.length}</p>
              <p><strong>ilblackdragon exists:</strong> {ilblackdragonUser ? 'Yes' : 'No'}</p>
            </div>
            
            {ilblackdragonUser && (
              <div className="bg-green-100 p-4 rounded mb-4">
                <h3 className="text-xl font-semibold mb-2">ilblackdragon User Data:</h3>
                <pre className="bg-white p-4 rounded overflow-auto max-h-60">
                  {JSON.stringify(ilblackdragonUser, null, 2)}
                </pre>
              </div>
            )}
            
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View all users ({users.length})
              </summary>
              <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(users, null, 2)}
              </pre>
            </details>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">agent_chain_general_agents Table</h2>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p><strong>Total agents:</strong> {generalAgents.length}</p>
              <p><strong>ilblackdragon exists:</strong> {ilblackdragonAgent ? 'Yes' : 'No'}</p>
            </div>
            
            {ilblackdragonAgent && (
              <div className="bg-green-100 p-4 rounded mb-4">
                <h3 className="text-xl font-semibold mb-2">ilblackdragon Agent Data:</h3>
                <pre className="bg-white p-4 rounded overflow-auto max-h-60">
                  {JSON.stringify(ilblackdragonAgent, null, 2)}
                </pre>
              </div>
            )}
            
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View all general agents ({generalAgents.length})
              </summary>
              <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(generalAgents, null, 2)}
              </pre>
            </details>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Direct Fetch Tests</h2>
            {directFetchResult ? (
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Test 1: agent_chain_users with .single()</h3>
                  <p><strong>Success:</strong> {!directFetchResult.test1.error ? 'Yes' : 'No'}</p>
                  {directFetchResult.test1.error && (
                    <p><strong>Error:</strong> {directFetchResult.test1.error.message} (Code: {directFetchResult.test1.error.code})</p>
                  )}
                  {directFetchResult.test1.data && (
                    <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(directFetchResult.test1.data, null, 2)}
                    </pre>
                  )}
                </div>
                
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Test 2: agent_chain_users without .single()</h3>
                  <p><strong>Success:</strong> {!directFetchResult.test2.error ? 'Yes' : 'No'}</p>
                  <p><strong>Count:</strong> {directFetchResult.test2.count}</p>
                  {directFetchResult.test2.error && (
                    <p><strong>Error:</strong> {directFetchResult.test2.error.message} (Code: {directFetchResult.test2.error.code})</p>
                  )}
                  {directFetchResult.test2.data && directFetchResult.test2.data.length > 0 && (
                    <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(directFetchResult.test2.data, null, 2)}
                    </pre>
                  )}
                </div>
                
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Test 3: agent_chain_general_agents with .single()</h3>
                  <p><strong>Success:</strong> {!directFetchResult.test3.error ? 'Yes' : 'No'}</p>
                  {directFetchResult.test3.error && (
                    <p><strong>Error:</strong> {directFetchResult.test3.error.message} (Code: {directFetchResult.test3.error.code})</p>
                  )}
                  {directFetchResult.test3.data && (
                    <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(directFetchResult.test3.data, null, 2)}
                    </pre>
                  )}
                </div>
                
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Test 4: agent_chain_general_agents without .single()</h3>
                  <p><strong>Success:</strong> {!directFetchResult.test4.error ? 'Yes' : 'No'}</p>
                  <p><strong>Count:</strong> {directFetchResult.test4.count}</p>
                  {directFetchResult.test4.error && (
                    <p><strong>Error:</strong> {directFetchResult.test4.error.message} (Code: {directFetchResult.test4.error.code})</p>
                  )}
                  {directFetchResult.test4.data && directFetchResult.test4.data.length > 0 && (
                    <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(directFetchResult.test4.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <p>No direct fetch results available.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
} 