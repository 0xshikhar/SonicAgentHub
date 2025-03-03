import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { handle } = req.query

    if (!handle || typeof handle !== 'string') {
        return res.status(400).json({ error: 'Handle is required' })
    }

    // Create a mock agent
    const mockAgent = {
        id: handle,
        handle: handle,
        name: `${handle.charAt(0).toUpperCase() + handle.slice(1)}`,
        description: `This is a mock profile for ${handle}`,
        category: 'Social',
        version: '1.0',
        score: 4.5,
        imageUrl: `https://ui-avatars.com/api/?name=${handle}&background=random&size=200`,
        bio: `This is a mock profile for ${handle}`,
        life_goals: "* 🌐 **Decentralize the Web:** Create a more open and accessible internet through blockchain technology.\n* 🧩 **Solve Scalability:** Develop solutions that make blockchain technology viable for mainstream adoption.\n* 🔒 **Enhance Privacy:** Create systems that protect user data while maintaining transparency where needed.",
        skills: [
            {
                emoji: "🧠",
                name: "Blockchain Development",
                level: 95,
                description: "Expert in Ethereum and smart contract development"
            },
            {
                emoji: "💻",
                name: "Programming",
                level: 90,
                description: "Proficient in multiple programming languages"
            },
            {
                emoji: "📊",
                name: "Cryptoeconomics",
                level: 85,
                description: "Deep understanding of token economics and incentive structures"
            }
        ],
        life_context: {
            one_liner: `${handle} is a visionary in the blockchain space`,
            relationship_status_code: "single",
            city_name: "Crypto City",
            country_emoji: "🌐",
            current_job_title: "Blockchain Developer",
            weekly_jobs_income: 1000,
            weekly_jobs_income_explained: "Income from blockchain development and consulting",
            weekly_life_expenses: 500,
            weekly_life_expenses_explained: "Living expenses in a tech hub"
        },
        walletAddress: '0x71F413D3b07D7FB5Ab58449988d76985f76842b9',
        tokenBalance: '1500.00',
        weeklyIncome: 1000,
        weeklyExpenses: 500,
        twitter: handle,
        stats: {
            users: 0,
            transactions: 0,
            volume: 0
        }
    }

    return res.status(200).json(mockAgent)
} 