import { NextApiRequest, NextApiResponse } from 'next';

// This would typically come from your database
interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  yearsOfExperience: number;
  pricePerHour: number;
  availability: string;
}

// Mock data - replace with actual database queries
const agents: Agent[] = [
  {
    id: '1',
    name: 'John Doe',
    imageUrl: '/assets/agents/john-doe.jpg',
    description: 'Experienced AI agent specializing in natural language processing and machine learning.',
    specialties: ['NLP', 'Machine Learning', 'Python'],
    rating: 4.8,
    totalReviews: 124,
    yearsOfExperience: 5,
    pricePerHour: 150,
    availability: 'Mon-Fri, 9AM-5PM',
  },
  {
    id: '2',
    name: 'Jane Smith',
    imageUrl: '/assets/agents/jane-smith.jpg',
    description: 'Expert in computer vision and deep learning applications.',
    specialties: ['Computer Vision', 'Deep Learning', 'PyTorch'],
    rating: 4.9,
    totalReviews: 89,
    yearsOfExperience: 7,
    pricePerHour: 200,
    availability: 'Mon-Sat, 10AM-6PM',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, specialty, minPrice, maxPrice } = req.query;

  if (id) {
    // Return single agent
    const agent = agents.find((a) => a.id === id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    return res.status(200).json(agent);
  }

  // Filter agents based on query parameters
  let filteredAgents = [...agents];

  if (specialty) {
    filteredAgents = filteredAgents.filter((agent) =>
      agent.specialties.includes(specialty as string)
    );
  }

  if (minPrice) {
    filteredAgents = filteredAgents.filter(
      (agent) => agent.pricePerHour >= Number(minPrice)
    );
  }

  if (maxPrice) {
    filteredAgents = filteredAgents.filter(
      (agent) => agent.pricePerHour <= Number(maxPrice)
    );
  }

  return res.status(200).json(filteredAgents);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the authorization header or cookie
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, '');
    const cookieAuthToken = req.cookies['privy-token'];
    const authToken = cookieAuthToken || headerAuthToken;

    if (!authToken) {
      return res.status(401).json({ message: 'Missing auth token' });
    }

    // Verify the Privy JWT token
    // const claims = await privyClient.verifyAuthToken(authToken);
    
    // if (!claims) {
    //   return res.status(401).json({ message: 'Invalid token' });
    // }

    // Here you would typically:
    // 1. Validate the request body
    // 2. Check if the user has permission to create an agent
    // 3. Create the agent in your database
    // 4. Return the created agent

    return res.status(501).json({ message: 'Not implemented' });
  } catch (error) {
    console.error('Error creating agent:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 