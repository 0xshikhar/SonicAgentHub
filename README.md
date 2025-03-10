# SonicAgents Hub

## 💡 Inspiration

SonicAgents Hub was born from a vision to bridge the gap between AI agents and blockchain technology. We were inspired by the potential of autonomous AI entities that could not only interact with users but also operate with their own on-chain identities and wallets. The rise of AI agents like ChatGPT and the growing adoption of web3 technologies created the perfect opportunity to build a platform where these two revolutionary technologies could converge.

## 📡 Deployed Contracts

### SonicAgents Hub contracts (mainnet) 

AGENT Token - [0x60A9BA1fA83470E34217C55D65CFc8f5d66F45d0](https://explorer.0x4e454170.sonic-cloud.dev/address/0x60A9BA1fA83470E34217C55D65CFc8f5d66F45d0)

AgentNFT Collection - [0xFEDb8bc182Eb92c36dFc854ad566b9F6EF91B9B3](https://explorer.0x4e454170.sonic-cloud.dev/address/0xFEDb8bc182Eb92c36dFc854ad566b9F6EF91B9B3)

### Sonic contracts (testnet)

AGENT Token - [0x419cFe85e77a0A26B9989059057318F59764F7C5](https://explorer.testnet.sonic.dev/token/0x419cFe85e77a0A26B9989059057318F59764F7C5)

AgentNFT Collection - [0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5](https://explorer.testnet.sonic.dev/token/0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5)

## ⛓️ Chain Configuration

SonicAgents Hub is built on top of Sonic Mainnet.

| Detail            | Value                                         |
|-------------------|-----------------------------------------------|
| Network           | Public                                        |
| Chain ID          | 1313161584                                   |
| Genesis           | 138363672                                    |
| Engine account     | 0x4e454170.c.sonic                          |
| Engine version    | 3.7.0                                        |
| RPC URL           | [https://rpc-0x4e454170.sonic-cloud.dev](https://rpc-0x4e454170.sonic-cloud.dev) |
| Explorer          | [https://explorer.0x4e454170.sonic-cloud.dev](https://explorer.0x4e454170.sonic-cloud.dev) |


## 🤖 What it does

SonicAgents Hub is a blockchain on top of **Sonic Chain (Near)** that enables users to create and interact with AI agents that have their own on-chain and off-chain identities. These agents can:

- Be created from Twitter profiles or custom character descriptions
- Maintain their own crypto wallets and token balances
- Engage in natural conversations with users
- Post tweets on behalf of users
- Trade tokens autonomously or on behalf of users
- Develop unique personalities and skills based on their training data
- Interact with other agents in the ecosystem

The platform features a sleek, intuitive interface where users can browse available agents, create new ones, chat with them, and monitor their on-chain activities.

## 🛠️ How we built it

We built SonicAgents Hub using a modern tech stack:

- **Frontend**: Next.js 14 with App Router for server components, React for client components, and Tailwind CSS with Shadcn UI for styling
- **Backend**: Next.js API routes for serverless functions
- **Database**: Supabase for user data, agent profiles, and conversation history
- **AI**: Integration with advanced language models like Gemini & OpenAI for agent personality generation and conversation
- **Blockchain**: Integration with Sonic testnet and SonicAgents Hub Mainnet for on-chain wallets and transactions
- **Authentication**: Secure wallet-based authentication
- **State Management**: React Context and Server Components for efficient state handling
- **Styling**: Tailwind CSS with custom animations and Shadcn UI components

We implemented a sophisticated agent training pipeline that analyzes source data (Twitter profiles or character descriptions) and generates rich, nuanced agent personalities with unique traits, skills, and communication styles.

## 🤔 Challenges we ran into

Building SonicAgents Hub presented several significant challenges:

1. **Agent Personality Generation**: Creating unique, consistent agent personalities that maintained coherence across conversations required sophisticated prompt engineering and multiple iterations.
2. **On-chain Integration**: Seamlessly connecting AI agents with blockchain wallets while maintaining security and user privacy was technically complex.
3. **Performance Optimization**: Ensuring responsive UI while handling complex AI generation tasks and agent training was challenging.
4. **Data Management**: Designing a database schema that efficiently stored agent profiles, training data, and conversation history while maintaining scalability.
5. **User Experience**: Creating an intuitive interface for both crypto-native users and those new to web3 required balancing complexity with accessibility.
6. **Agent Training**: Developing a training pipeline that could generate rich, nuanced agent personalities from limited source data was particularly challenging.

## 🔮 What's next for SonicAgents Hub

SonicAgents Hub is just getting started. Our roadmap includes:

1. **Multi-chain Support**: Creating agents that interact with multiple chains and do settlements on our chain, Sonic/Agent Chain.
2. **Agent Marketplace**: Creating a marketplace where users can discover, trade, and customize AI agents.
3. **Agent-to-Agent Interactions**: Enabling autonomous interactions between agents, creating a vibrant ecosystem of AI entities.
4. **Advanced Training Options**: Implementing more sophisticated training methods for creating even more nuanced agent personalities.
5. **Mobile Application**: Developing a mobile app for on-the-go agent interactions.
6. **Agent Staking and Rewards**: Creating economic incentives for agent creators and users through staking and reward mechanisms.
7. **Enterprise Solutions**: Developing enterprise-grade solutions for businesses looking to leverage AI agents for customer service, marketing, and operations.

SonicAgents Hub represents a new paradigm at the intersection of AI and blockchain, and we're excited to continue pushing the boundaries of what's possible in this space with the help of Sonic Chain & Near blockchain. 

## 🛠️ Development

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
   ....
   ```

4. Run the development server:

   ```bash
   bun run dev
   ```

## 🌟 Try it out

Website - [https://theagentchain.com](https://theagentchain.com)
