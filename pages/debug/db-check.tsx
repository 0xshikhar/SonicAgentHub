import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DbCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState('ilblackdragon');

  useEffect(() => {
    if (router.isReady) {
      const queryHandle = router.query.handle as string;
      if (queryHandle) {
        setHandle(queryHandle);
      }
      fetchData(queryHandle || handle);
    }
  }, [router.isReady, router.query.handle]);

  async function fetchData(targetHandle: string) {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/debug/raw-db-check?handle=${targetHandle}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      setData(result);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/debug/db-check?handle=${handle}`, undefined, { shallow: true });
    fetchData(handle);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Check Debug Tool</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Enter handle to check"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check
          </button>
        </div>
      </form>
      
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
      ) : data ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Target Handle: {data.targetHandle}</h2>
            
            {data.matchingUser ? (
              <div className="bg-green-100 p-4 rounded mb-4">
                <h3 className="text-xl font-semibold mb-2">Matching User Found:</h3>
                <pre className="bg-white p-4 rounded overflow-auto max-h-60">
                  {JSON.stringify(data.matchingUser, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-yellow-100 p-4 rounded mb-4">
                <p className="font-semibold">No matching user found for handle: {data.targetHandle}</p>
              </div>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Query Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Method</th>
                    <th className="py-2 px-4 border-b">Success</th>
                    <th className="py-2 px-4 border-b">Count</th>
                    <th className="py-2 px-4 border-b">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {data.queryResults.map((result: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{result.method}</td>
                      <td className="py-2 px-4 border-b">{result.success ? '✅' : '❌'}</td>
                      <td className="py-2 px-4 border-b">{result.count}</td>
                      <td className="py-2 px-4 border-b text-red-500">{result.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">All Users in agent_chain_users</h2>
            {data.usersError ? (
              <div className="bg-red-100 p-4 rounded">
                <p>Error: {data.usersError}</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>Total users:</strong> {data.allUsers.length}</p>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">User Handles:</h3>
                  <ul className="list-disc pl-5">
                    {data.allUsers.map((user: any) => (
                      <li key={user.handle} className="mb-1">
                        <span className="font-mono">{user.handle}</span>
                        {user.display_name && ` (${user.display_name})`}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View all user data
                  </summary>
                  <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-96">
                    {JSON.stringify(data.allUsers, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Column Information</h2>
            {data.columnError ? (
              <div className="bg-red-100 p-4 rounded">
                <p>Error: {data.columnError}</p>
              </div>
            ) : (
              <pre className="bg-white p-4 rounded overflow-auto max-h-96 border border-gray-200">
                {JSON.stringify(data.columnInfo, null, 2)}
              </pre>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Tables Information</h2>
            {data.tablesError ? (
              <div className="bg-red-100 p-4 rounded">
                <p>Error: {data.tablesError}</p>
              </div>
            ) : (
              <pre className="bg-white p-4 rounded overflow-auto max-h-96 border border-gray-200">
                {JSON.stringify(data.tables, null, 2)}
              </pre>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Raw Response</h2>
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View raw API response
              </summary>
              <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-96 border border-gray-200">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </section>
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
} 