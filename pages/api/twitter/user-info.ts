import { NextApiRequest, NextApiResponse } from 'next'
import { getTwitterUserInfo } from '@/lib/socialData'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { username } = req.query

    // Validate username
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' })
    }

    try {
        const userData = await getTwitterUserInfo(username)
        return res.status(200).json(userData)
    } catch (error) {
        console.error('Error fetching Twitter user info:', error)
        return res.status(500).json({
            error: 'Failed to fetch Twitter user info',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
} 