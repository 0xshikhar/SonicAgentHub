# The Agent Chain 

The Agent Chain is a blockchain based on Aurora for creating, sharing, and using AI agents. It allows users to create custom agents that can be used to interact with the platform and other users.

## Features

- Wallet-based authentication using Wagmi
- User profiles with customizable information
- Tweet functionality with real-time updates
- Supabase integration for data storage
- Modern UI with responsive design

## Authentication Flow

The application uses wallet-based authentication:

1. Users connect their wallet using the Connect Wallet button in the navbar
2. Once connected, a cookie is set to maintain the authentication state
3. Protected routes check for this cookie and redirect to the home page with a toast message if not authenticated


## Development

### Prerequisites

- Node.js 18+
- Bun package manager

### Setup

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:

```bash
bun dev
```

## Toast Notifications

The application uses Sonner for toast notifications. Toast messages are shown for:

- Authentication errors
- Form submission success/failure
- API request success/failure
- Wallet connection/disconnection

## Middleware

The middleware checks for the `wallet-connected` cookie on protected routes and redirects to the home page with a toast message if not authenticated.
