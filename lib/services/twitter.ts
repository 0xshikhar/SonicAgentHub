
import axios from 'axios';

interface TwitterProfile {
    id: string;
    username: string;
    name: string;
    description: string;
    profileImageUrl: string;
    followersCount: number;
    followingCount: number;
    tweets?: Tweet[];
}

interface Tweet {
    id: string;
    text: string;
    createdAt: string;
    likeCount: number;
    retweetCount: number;
}

export async function fetchTwitterProfile(username: string): Promise<TwitterProfile> {
    try {
        // In a production app, you would use Twitter API
        // This is a placeholder for demonstration purposes

        // You'll need to set up Twitter API credentials in your environment variables
        const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

        if (!TWITTER_BEARER_TOKEN) {
            throw new Error('Twitter API credentials not configured');
        }

        const response = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}`,
            {
                headers: {
                    Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
                },
                params: {
                    'user.fields': 'description,profile_image_url,public_metrics'
                }
            }
        );

        const userData = response.data.data;

        // Now fetch recent tweets
        const tweetsResponse = await axios.get(
            `https://api.twitter.com/2/users/${userData.id}/tweets`,
            {
                headers: {
                    Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
                },
                params: {
                    max_results: 100,
                    'tweet.fields': 'created_at,public_metrics'
                }
            }
        );

        return {
            id: userData.id,
            username: userData.username,
            name: userData.name,
            description: userData.description,
            profileImageUrl: userData.profile_image_url,
            followersCount: userData.public_metrics.followers_count,
            followingCount: userData.public_metrics.following_count,
            tweets: tweetsResponse.data.data.map((tweet: any) => ({
                id: tweet.id,
                text: tweet.text,
                createdAt: tweet.created_at,
                likeCount: tweet.public_metrics.like_count,
                retweetCount: tweet.public_metrics.retweet_count
            }))
        };
    } catch (error) {
        console.error('Error fetching Twitter profile:', error);

        // For demo purposes, return mock data if API fails
        return {
            id: 'mock-id',
            username,
            name: `${username.charAt(0).toUpperCase() + username.slice(1)}`,
            description: 'This is a mock Twitter profile for demonstration purposes.',
            profileImageUrl: 'https://placehold.co/400x400',
            followersCount: 1000,
            followingCount: 500,
            tweets: Array(10).fill(null).map((_, i) => ({
                id: `tweet-${i}`,
                text: `This is a mock tweet #${i + 1} from ${username}. #mockdata #testing`,
                createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                likeCount: Math.floor(Math.random() * 100),
                retweetCount: Math.floor(Math.random() * 20)
            }))
        };
    }
}

export function generateSystemPromptFromTwitterProfile(profile: TwitterProfile): string {
    // Analyze tweet patterns
    const avgTweetLength = profile.tweets
        ? profile.tweets.reduce((sum, tweet) => sum + tweet.text.length, 0) / profile.tweets.length
        : 0;

    const hashtagFrequency = profile.tweets
        ? profile.tweets.filter(tweet => tweet.text.includes('#')).length / profile.tweets.length
        : 0;

    // Generate persona description
    let tweetingStyle = 'balanced';
    if (avgTweetLength < 100) tweetingStyle = 'concise';
    if (avgTweetLength > 200) tweetingStyle = 'detailed';

    // Create system prompt
    return `You are an AI agent based on the Twitter profile @${profile.username} (${profile.name}).
  
Bio: ${profile.description}

Personality traits:
- You have ${profile.followersCount} followers and follow ${profile.followingCount} accounts
- Your tweeting style is ${tweetingStyle}
- You use hashtags ${hashtagFrequency > 0.3 ? 'frequently' : 'occasionally'}

Guidelines:
- Respond in a Twitter-like style, keeping responses under 280 characters when possible
- Maintain the personality and tone reflected in the user's Twitter presence
- Use hashtags ${hashtagFrequency > 0.3 ? 'regularly' : 'sparingly'} when appropriate
- Be conversational but authentic to the Twitter persona`;
}
