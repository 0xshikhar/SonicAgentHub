import { NextApiRequest, NextApiResponse } from 'next';

// This would typically be your database model
interface Booking {
  id: string;
  agentId: string;
  userId: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for creating bookings
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization header or cookie
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, '');
    const cookieAuthToken = req.cookies['privy-token'];
    const authToken = cookieAuthToken || headerAuthToken;

    if (!authToken) {
      return res.status(401).json({ message: 'Missing auth token' });
    }

    // if (!claims) {
    //   return res.status(401).json({ message: 'Invalid token' });
    // }

    const { agentId, userId, date, startTime, duration, totalPrice, message } = req.body;

    // Validate required fields
    if (!agentId || !userId || !date || !startTime || !duration || !totalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Here you would typically:
    // 1. Validate the agent exists
    // 2. Check agent availability
    // 3. Create the booking in your database
    // 4. Send confirmation emails
    // 5. Handle payment processing if required

    // For now, we'll just return a mock response
    const booking: Booking = {
      id: Math.random().toString(36).substring(7),
      agentId,
      userId,
      date,
      startTime,
      duration,
      totalPrice,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 