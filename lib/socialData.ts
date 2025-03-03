import axios, { AxiosResponse } from "axios";
import {
    MAX_PUBLICATIONS_WHEN_PARSING_PROFILE,
    MAX_TWEET_API_CALL_COUNT,
} from "./constants";
import { FetchedTweet, FetchedTwitterUser } from "./types";
import { cleanHandle, goodTwitterImage } from "./strings";
import { postErrorToDiscord } from "./discord";

export const getTwitterUserInfo = async (twitterHandle: string): Promise<FetchedTwitterUser> => {
    twitterHandle = twitterHandle.replace("@", "").trim().toLowerCase();

    const url = `https://api.socialdata.tools/twitter/user/${twitterHandle}`;
    const headers = {
        Authorization: `Bearer ${process.env.SOCIAL_DATA_TOOLS_API_KEY}`,
        Accept: "application/json",
    };

    try {
        console.log("🐽 twitter user info url", url);
        // for now, just return a mock response - to avoid api costs
        console.log("its working");

        // Return a consistent mock Twitter user with more detailed data
        // return {
        //     id: 12345678,
        //     id_str: "12345678",
        //     name: `${twitterHandle.charAt(0).toUpperCase() + twitterHandle.slice(1)}`,
        //     screen_name: twitterHandle,
        //     location: "Internet",
        //     url: `https://twitter.com/${twitterHandle}`,
        //     description: `This is a mock profile for ${twitterHandle}`,
        //     protected: false,
        //     verified: Math.random() > 0.7, // Some users are verified
        //     followers_count: Math.floor(10000 + Math.random() * 990000), // 10K to 1M followers
        //     friends_count: Math.floor(500 + Math.random() * 4500), // 500 to 5K friends
        //     listed_count: Math.floor(10 + Math.random() * 90), // 10 to 100 listed
        //     favourites_count: Math.floor(1000 + Math.random() * 9000), // 1K to 10K favorites
        //     statuses_count: Math.floor(5000 + Math.random() * 15000), // 5K to 20K statuses
        //     created_at: new Date(2010 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
        //     profile_banner_url: `https://picsum.photos/seed/${twitterHandle}/800/200`,
        //     profile_image_url_https: `https://ui-avatars.com/api/?name=${twitterHandle}&background=random&size=200`,
        //     default_profile: false,
        //     default_profile_image: false,
        //     withheld_in_countries: [],
        //     withheld_scope: "",
        //     can_dm: false,
        // };

        // In production, uncomment this:
        const response = await axios.get(url, { headers });
        console.log("🐽 twitter user info response.data", response.data);
        return response.data;
    } catch (error) {
        // await postErrorToDiscord(`🔴 Error fetching Twitter user info for: ${twitterHandle}`);
        console.error(`🔴 Error fetching Twitter user info:`, error);
        throw new Error(`Failed to fetch Twitter user info for ${twitterHandle}`);
    }
};

interface ApiResponse {
    tweets: FetchedTweet[];
    next_cursor?: string;
}

export const getTweetsFromUser = async (
    userHandle: string
): Promise<{ allTweets: FetchedTweet[] } | null> => {
    try {
        userHandle = cleanHandle(userHandle);

        const baseUrl = `https://api.socialdata.tools/twitter/search?query=from%3A${userHandle}${encodeURIComponent(
            " " + "-filter:replies"
        )}&type=Latest`;

        const headers = {
            Authorization: `Bearer ${process.env.SOCIAL_DATA_TOOLS_API_KEY}`,
            Accept: "application/json",
        };

        // Generate consistent mock tweets with detailed metadata
        // const mockTweets: FetchedTweet[] = [];

        // Generate 10 mock tweets with consistent IDs based on handle
        // for (let i = 1; i <= 10; i++) {
        //     const tweetDate = new Date();
        //     tweetDate.setDate(tweetDate.getDate() - i); // Each tweet is a day older

        //     // Create a deterministic ID based on handle and index
        //     const tweetId = `${userHandle}-tweet-${i}`;

        //     mockTweets.push({
        //         id: tweetId,
        //         user_handle: userHandle,
        //         text: `This is mock tweet #${i} from ${userHandle}`,
        //         full_text: `This is a longer version of mock tweet #${i} from ${userHandle}. #mockdata #testing #ai #blockchain`,
        //         tweet_created_at: tweetDate.toISOString(),
        //         favorite_count: Math.floor(Math.random() * 100),
        //         reply_count: Math.floor(Math.random() * 20),
        //         retweet_count: Math.floor(Math.random() * 50),
        //         quote_count: Math.floor(Math.random() * 10),
        //         id_str: tweetId,
        //         user: {
        //             screen_name: userHandle,
        //             profile_image_url_https: `https://ui-avatars.com/api/?name=${userHandle}&background=random`,
        //         },
        //         user__screen_name: userHandle,
        //         user__profile_image_url_https: `https://ui-avatars.com/api/?name=${userHandle}&background=random`,
        //         sentiment: ["positive", "negative", "neutral"][Math.floor(Math.random() * 3)],
        //         emotional_tone: ["happy", "sad", "angry", "excited"][Math.floor(Math.random() * 4)],
        //         optimism_score: Math.random(),
        //         toxicity_level: Math.random() * 0.3, // Keep toxicity low
        //         subjectivity: Math.random(),
        //         topic_categorization: ["tech", "politics", "entertainment", "sports"][Math.floor(Math.random() * 4)],
        //         language_complexity: Math.random() * 10,
        //         engagement_potential: Math.random(),
        //         humor_or_sarcasm: Math.random() > 0.7 ? "humor" : "none",
        //         polarity_intensity: Math.random(),
        //         hashtags: ["mockdata", "testing", "ai", "blockchain"],
        //         urls: [`https://example.com/${userHandle}/tweet/${i}`],
        //         media: i % 3 === 0 ? [{
        //             type: "photo",
        //             url: `https://picsum.photos/seed/${userHandle}-${i}/400/300`
        //         }] : [],
        //     });
        // }

        let allTweets = [] as FetchedTweet[];
        let cursor: string | null = null;
        let callCount = 0;

        do {
            const url: string = cursor
                ? `${baseUrl}&cursor=${encodeURIComponent(cursor)}`
                : baseUrl;

            try {
                const response: AxiosResponse<ApiResponse> = await axios.get(url, {
                    headers,
                });
                callCount++;

                console.log(
                    " 🐽 reading tweets from user",
                    userHandle,
                    "call#" + callCount
                );

                if (response.data.tweets && Array.isArray(response.data.tweets)) {
                    allTweets = allTweets.concat(response.data.tweets);
                }
                cursor = response.data.next_cursor || null;
            } catch (error) {
                console.error(`Error in call ${callCount}:`, error);
                break;

            }
        } while (
            (cursor !== null || callCount < MAX_TWEET_API_CALL_COUNT) &&
            allTweets.length < MAX_PUBLICATIONS_WHEN_PARSING_PROFILE
        );

        const allTweetsRaw = allTweets.map((tweet) => {
            const objectFiltered = {
                tweet_created_at: tweet.tweet_created_at,
                id: tweet.id,
                full_text: tweet.full_text,
                favorite_count: tweet.favorite_count,
                user_handle: userHandle,
                reply_count: tweet.reply_count,
                retweet_count: tweet.retweet_count,
                quote_count: tweet.quote_count,
                id_str: tweet.id_str,
                user: {
                    screen_name: tweet.user.screen_name,
                    profile_image_url_https: tweet.user.profile_image_url_https.replace(
                        "_normal",
                        "_400x400"
                    ),
                },
            } as FetchedTweet;
            return objectFiltered;
        });


        return { allTweets: allTweetsRaw };
    } catch (error) {
        // await postErrorToDiscord("🔴 Error in getTweetsFromUser: " + userHandle);
        console.error("🔴 Error in getTweetsFromUser:", error);
        return null;
    }
};

export const searchTweets = async (topic: string) => {
    const url = `https://api.socialdata.tools/twitter/search?query=${topic}`;
    const headers = {
        Authorization: `Bearer ${process.env.SOCIAL_DATA_TOOLS_API_KEY}`,
        Accept: "application/json",
    };
    // for now, just return a mock response - to avoid api costs
    console.log("its working");
    const response = await axios.get(url, { headers });
    return response.data;
};

/**
 * Analyzes a user's tweets to extract key characteristics for AI agent training
 * @param userHandle Twitter handle to analyze
 * @returns Object containing analyzed characteristics or null if analysis fails
 */
export const analyzeUserTweetsForAgentTraining = async (userHandle: string) => {
    try {
        userHandle = cleanHandle(userHandle);

        // Get user profile information
        const userInfo = await getTwitterUserInfo(userHandle);

        // Get user tweets
        const tweetsData = await getTweetsFromUser(userHandle);

        if (!tweetsData || !tweetsData.allTweets.length) {
            throw new Error(`No tweets found for user ${userHandle}`);
        }

        // Extract tweet texts for analysis
        const tweetTexts = tweetsData.allTweets.map(tweet => tweet.full_text);

        // Prepare data for AI analysis
        const analysisData = {
            userHandle,
            userInfo,
            tweetSample: tweetTexts.slice(0, 50), // Limit to 50 tweets for analysis
            engagementMetrics: calculateEngagementMetrics(tweetsData.allTweets),
            topicDistribution: identifyTopicDistribution(tweetsData.allTweets),
            writingStyle: analyzeWritingStyle(tweetTexts),
            interactionPatterns: analyzeInteractionPatterns(tweetsData.allTweets)
        };

        return analysisData;
    } catch (error) {
        await postErrorToDiscord(`🔴 Error analyzing tweets for agent training: ${userHandle}`);
        console.error("🔴 Error analyzing tweets for agent training:", error);
        return null;
    }
};

/**
 * Calculates engagement metrics from a collection of tweets
 */
function calculateEngagementMetrics(tweets: FetchedTweet[]) {
    if (!tweets.length) return null;

    const totalLikes = tweets.reduce((sum, tweet) => sum + (tweet.favorite_count || 0), 0);
    const totalRetweets = tweets.reduce((sum, tweet) => sum + (tweet.retweet_count || 0), 0);
    const totalReplies = tweets.reduce((sum, tweet) => sum + (tweet.reply_count || 0), 0);
    const totalQuotes = tweets.reduce((sum, tweet) => sum + (tweet.quote_count || 0), 0);

    return {
        averageLikes: totalLikes / tweets.length,
        averageRetweets: totalRetweets / tweets.length,
        averageReplies: totalReplies / tweets.length,
        averageQuotes: totalQuotes / tweets.length,
        totalEngagement: totalLikes + totalRetweets + totalReplies + totalQuotes,
        engagementRate: (totalLikes + totalRetweets + totalReplies + totalQuotes) / tweets.length
    };
}

/**
 * Identifies topic distribution from tweets
 */
function identifyTopicDistribution(tweets: FetchedTweet[]) {
    // This is a placeholder - in a real implementation, you would use NLP to extract topics
    return {
        topics: ["placeholder - would use NLP in real implementation"],
        topicFrequency: {}
    };
}

/**
 * Analyzes writing style from tweet texts
 */
function analyzeWritingStyle(tweetTexts: string[]) {
    if (!tweetTexts.length) return null;

    // Calculate average tweet length
    const averageLength = tweetTexts.reduce((sum, text) => sum + text.length, 0) / tweetTexts.length;

    // Count hashtags and mentions
    const hashtagCount = tweetTexts.reduce((count, text) => {
        const matches = text.match(/#\w+/g);
        return count + (matches ? matches.length : 0);
    }, 0);

    const mentionCount = tweetTexts.reduce((count, text) => {
        const matches = text.match(/@\w+/g);
        return count + (matches ? matches.length : 0);
    }, 0);

    return {
        averageTweetLength: averageLength,
        hashtagsPerTweet: hashtagCount / tweetTexts.length,
        mentionsPerTweet: mentionCount / tweetTexts.length,
        usesEmojis: tweetTexts.some(text => /[\p{Emoji}]/u.test(text)),
        usesHashtags: hashtagCount > 0,
        usesMentions: mentionCount > 0
    };
}

/**
 * Analyzes interaction patterns from tweets
 */
function analyzeInteractionPatterns(tweets: FetchedTweet[]) {
    // This is a placeholder - in a real implementation, you would analyze reply patterns, etc.
    return {
        repliesFrequency: "placeholder - would analyze in real implementation",
        retweetsFrequency: "placeholder - would analyze in real implementation"
    };
}

/**
 * Creates a training dataset for an AI agent based on a Twitter profile
 * @param userHandle Twitter handle to create training data from
 * @returns Training dataset for AI agent or null if creation fails
 */
export const createAgentTrainingDataset = async (userHandle: string) => {
    try {
        // Get user analysis
        const userAnalysis = await analyzeUserTweetsForAgentTraining(userHandle);

        if (!userAnalysis) {
            throw new Error(`Failed to analyze user ${userHandle} for training data`);
        }

        // Create training dataset
        const trainingDataset = {
            profileInfo: {
                handle: userHandle,
                displayName: userAnalysis.userInfo.name,
                bio: userAnalysis.userInfo.description,
                profileImage: goodTwitterImage(userAnalysis.userInfo.profile_image_url_https),
                followerCount: userAnalysis.userInfo.followers_count,
                followingCount: userAnalysis.userInfo.friends_count,
            },
            contentSamples: userAnalysis.tweetSample,
            writingStyle: userAnalysis.writingStyle,
            topicInterests: userAnalysis.topicDistribution,
            engagementPatterns: userAnalysis.engagementMetrics,
            interactionBehavior: userAnalysis.interactionPatterns,
        };

        return trainingDataset;
    } catch (error) {
        await postErrorToDiscord(`🔴 Error creating agent training dataset: ${userHandle}`);
        console.error("🔴 Error creating agent training dataset:", error);
        return null;
    }
};

