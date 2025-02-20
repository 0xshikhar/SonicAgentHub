import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient, AuthTokenClaims } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export type AuthenticateSuccessResponse = {
  claims: AuthTokenClaims;
};

export type AuthenticationErrorResponse = {
  error: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    AuthenticateSuccessResponse | AuthenticationErrorResponse
  >,
) {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const verified = await client.verifyAuthToken(authToken);

    if (!verified) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }

    return res.status(200).json({ claims: verified });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export default handler;
