import { useState } from 'react'
import { FetchedTwitterUser } from '@/lib/types'
import axios from 'axios'

function TwitterTest() {
  const [username, setUsername] = useState('')
  const [userData, setUserData] = useState<FetchedTwitterUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a Twitter username')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`/api/twitter/user-info?username=${encodeURIComponent(username)}`)
      setUserData(response.data)
    } catch (err) {
      console.error('Error fetching Twitter user info:', err)
      
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || err.response.data.error || 'Failed to fetch user data')
      } else {
        setError('An unexpected error occurred')
      }
      
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Twitter User Info Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Twitter Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Twitter username (without @)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch User Info'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {userData && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {userData.profile_image_url_https && (
                <img
                  src={userData.profile_image_url_https.replace('_normal', '_400x400')}
                  alt={userData.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-gray-600">@{userData.screen_name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {userData.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                  <p>{userData.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Followers</h3>
                  <p className="text-lg font-semibold">{userData.followers_count.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Following</h3>
                  <p className="text-lg font-semibold">{userData.friends_count.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tweets</h3>
                  <p className="text-lg font-semibold">{userData.statuses_count.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p>{userData.location || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                <p>{new Date(userData.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Raw Response Data</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default TwitterTest 