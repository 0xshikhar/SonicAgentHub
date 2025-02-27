import { Pool, PoolClient, types } from "pg";
import { PAGE_SIZE } from "./constants";
import {
    RawUser,
    ActionEvent,
    AgentTweet,
    LifeGoalsChange,
    SkillsChange,
    LifeContextChange,
    SavedTweet,
    FetchedTweet,
} from "./types";
import { cleanHandle, goodTwitterImage } from "./strings";

// Set up type parsers for numeric and bigint types
types.setTypeParser(1700, function (val: any) {
    return parseFloat(val);
});

types.setTypeParser(20, function (val: any) {
    return parseInt(val, 10);
});

let pool: Pool | null = null;

const getPool = (): Pool => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL || "",
            ssl: {
                rejectUnauthorized: false,
            },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on("error", (err: Error) => {
            console.error("Unexpected error on idle client", err);
            pool = null;
        });
    }
    return pool;
};

export const executeQuery = async <T = any>(
    query: string,
    params: Array<any> = []
): Promise<T> => {
    const pool = getPool();
    const client: PoolClient = await pool.connect();

    try {
        const res = await client.query(query, params);
        return res as T;
    } catch (error: any) {
        console.error("Error executing query", error.stack);
        throw error;
    } finally {
        client.release();
    }
};

// Clean up on application termination
process.on("SIGTERM", async () => {
    if (pool) {
        await pool.end();
        pool = null;
    }
});

// User functions
export const saveNewUser = async (profile: RawUser): Promise<boolean> => {
    try {
        const handle = cleanHandle(profile.handle);

        const res = await executeQuery(
            `INSERT INTO sim_users (handle, display_name, profile_picture, twitter_id, cover_picture, bio, life_goals, skills, life_context) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                handle,
                profile.display_name,
                goodTwitterImage(profile.profile_picture),
                profile.twitter_id,
                profile.cover_picture,
                profile.bio,
                profile.life_goals,
                JSON.stringify(profile.skills),
                JSON.stringify(profile.life_context),
            ]
        );
        console.log(`New user created: ${handle}`);
        return true;
    } catch (error) {
        console.error("Error in saveNewUser:", error);
        return false;
    }
};

export const findUserByHandle = async (
    handle: string
): Promise<RawUser | null> => {
    try {
        handle = cleanHandle(handle);
        const res = await executeQuery(
            `SELECT * FROM sim_users WHERE handle = $1`,
            [handle]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error in findUserByHandle:", error);
        return null;
    }
};

export const getUsers = async (): Promise<RawUser[]> => {
    const res = await executeQuery(`SELECT * FROM sim_users`);
    return res.rows;
};

export const deleteUserByHandle = async (handle: string): Promise<boolean> => {
    try {
        handle = cleanHandle(handle);

        // Delete related records first
        await executeQuery(`DELETE FROM sim_agent_tweets WHERE handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_action_events WHERE from_handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_action_events WHERE to_handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_updates_skills WHERE handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_updates_life_goals WHERE handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_updates_life_context WHERE handle = $1`, [handle]);
        await executeQuery(`DELETE FROM sim_wallets WHERE handle = $1`, [handle]);

        // Finally delete the user
        await executeQuery(`DELETE FROM sim_users WHERE handle = $1`, [handle]);

        console.log(`User deleted: ${handle}`);
        return true;
    } catch (error) {
        console.error("Error in deleteUserByHandle:", error);
        return false;
    }
};

// Action events functions
export const saveNewActionEvent = async (actionEvent: ActionEvent): Promise<string | null> => {
    try {
        const res = await executeQuery(
            `INSERT INTO sim_action_events (from_handle, action_type, main_output, story_context, to_handle, extra_data, top_level_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
            [
                actionEvent.from_handle,
                actionEvent.action_type,
                actionEvent.main_output,
                actionEvent.story_context,
                actionEvent.to_handle,
                actionEvent.extra_data,
                actionEvent.top_level_type,
            ]
        );
        return res.rows[0].id;
    } catch (error) {
        console.error("Error in saveNewActionEvent:", error);
        return null;
    }
};

export const getRecentActionEvents = async (): Promise<ActionEvent[]> => {
    const res = await executeQuery(
        `SELECT * FROM sim_action_events ORDER BY created_at DESC LIMIT 10`
    );
    return res.rows;
};

export const getActionEventsByHandle = async (handle: string): Promise<ActionEvent[]> => {
    const res = await executeQuery(
        `SELECT * FROM sim_action_events WHERE from_handle = $1`,
        [handle]
    );
    return res.rows;
};

// Tweets functions
export const saveNewAgentTweet = async (agentTweet: AgentTweet) => {
    try {
        const res = await executeQuery(
            `INSERT INTO sim_agent_tweets (handle, content, link, image_url, link_preview_img_url, link_title, action_type, action_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
            [
                agentTweet.handle,
                agentTweet.content,
                agentTweet.link,
                agentTweet.image_url,
                agentTweet.link_preview_img_url,
                agentTweet.link_title,
                agentTweet.action_type,
                agentTweet.action_id,
            ]
        );
        console.log(`New tweet by ${agentTweet.handle}: ${agentTweet.content.substring(0, 30)}...`);
        return res.rows[0];
    } catch (error) {
        console.error("Error in saveNewAgentTweet:", error);
        return null;
    }
};

export const getRecentAgentTweets = async () => {
    const res = await executeQuery(
        `SELECT * FROM sim_agent_tweets ORDER BY created_at DESC LIMIT 10`
    );
    return res.rows;
};

export const getRecentAgentTweetsWithUserInfo = async () => {
    const res = await executeQuery(
        `SELECT 
      t.*,
      u.display_name,
      u.profile_picture
    FROM sim_agent_tweets t
    LEFT JOIN sim_users u ON t.handle = u.handle
    ORDER BY t.created_at DESC 
    LIMIT 50`
    );
    return res.rows;
};

export const getAgentTweetsByHandle = async (handle: string) => {
    const res = await executeQuery(
        `SELECT 
      t.*,
      u.display_name,
      u.profile_picture
    FROM sim_agent_tweets t
    LEFT JOIN sim_users u ON t.handle = u.handle
    WHERE t.handle = $1 
    ORDER BY t.created_at DESC 
    LIMIT $2`,
        [handle, PAGE_SIZE]
    );
    return res.rows;
};

// Life goals, skills, and context functions
export const saveNewLifeGoalsChange = async (lifeGoalsChange: LifeGoalsChange) => {
    const res = await executeQuery(
        `INSERT INTO sim_updates_life_goals (handle, previous_life_goals, new_life_goals, summary_of_the_changes, action_id) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
        [
            lifeGoalsChange.handle,
            lifeGoalsChange.previous_life_goals,
            lifeGoalsChange.new_life_goals,
            lifeGoalsChange.summary_of_the_changes,
            lifeGoalsChange.action_id,
        ]
    );
    return res.rows[0];
};

export const updateUserLifeGoals = async (handle: string, newLifeGoals: string) => {
    const res = await executeQuery(
        `UPDATE sim_users SET life_goals = $1 WHERE handle = $2`,
        [newLifeGoals, handle]
    );
    return res.rows[0];
};

export const saveNewSkillsChange = async (skillsChange: SkillsChange) => {
    const res = await executeQuery(
        `INSERT INTO sim_updates_skills (handle, previous_skills, new_skills, summary_of_the_changes, action_id) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
        [
            skillsChange.handle,
            skillsChange.previous_skills,
            skillsChange.new_skills,
            skillsChange.summary_of_the_changes,
            skillsChange.action_id,
        ]
    );
    return res.rows[0];
};

export const updateUserSkills = async (handle: string, newSkills: string) => {
    const res = await executeQuery(
        `UPDATE sim_users SET skills = $1 WHERE handle = $2`,
        [newSkills, handle]
    );
    return res.rows[0];
};

export const saveNewLifeContextChange = async (lifeContextChange: LifeContextChange) => {
    const res = await executeQuery(
        `INSERT INTO sim_updates_life_context (handle, previous_life_context, new_life_context, summary_of_the_changes, action_id) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
        [
            lifeContextChange.handle,
            lifeContextChange.previous_life_context,
            lifeContextChange.new_life_context,
            lifeContextChange.summary_of_the_changes,
            lifeContextChange.action_id,
        ]
    );
    return res.rows[0];
};

export const updateUserLifeContext = async (handle: string, newLifeContext: string) => {
    const res = await executeQuery(
        `UPDATE sim_users SET life_context = $1 WHERE handle = $2`,
        [newLifeContext, handle]
    );
    return res.rows[0];
};

// Saved tweets functions
export const readIRLTweets = async ({ handle }: { handle: string }): Promise<SavedTweet[]> => {
    const res = await executeQuery(
        `SELECT * FROM sim_saved_tweets WHERE handle = $1`,
        [handle]
    );
    return res.rows;
};

export const saveIRLTweets = async ({
    handle,
    tweets,
}: {
    handle: string;
    tweets: FetchedTweet[];
}) => {
    if (!tweets || tweets.length === 0) return;

    const columns = ["id", "handle", "content", "posted_at"];
    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const tweet of tweets) {
        placeholders.push(
            `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
        );
        values.push(
            tweet.id,
            handle,
            tweet.full_text,
            tweet.tweet_created_at
        );
    }

    const query = `
    INSERT INTO sim_saved_tweets (${columns.join(", ")})
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (id) DO NOTHING
  `;

    try {
        await executeQuery(query, values);
    } catch (error) {
        console.error("Error inserting saved tweets", error);
    }
};

// Wallet functions
export const getWalletByHandle = async (handle: string) => {
    handle = cleanHandle(handle);
    const res = await executeQuery(
        `SELECT * FROM sim_wallets WHERE handle = $1`,
        [handle]
    );
    return res.rows[0];
};

export const createWallet = async ({
    handle,
    address,
    privateKey,
    permitSignature,
}: {
    handle: string;
    address: string;
    privateKey: string;
    permitSignature: string;
}) => {
    await executeQuery(
        `INSERT INTO sim_wallets (handle, address, private_key, permit_signature) VALUES ($1, $2, $3, $4)`,
        [handle, address, privateKey, permitSignature]
    );
};

// Additional utility functions
export const getRandomClone = async () => {
    const res = await executeQuery(
        `SELECT * FROM sim_users ORDER BY RANDOM() LIMIT 1`
    );
    return res.rows[0];
};

export const findRandomUserNotYou = async (handle: string) => {
    const res = await executeQuery(
        `SELECT handle FROM sim_users WHERE handle != $1 ORDER BY RANDOM() LIMIT 1`,
        [handle]
    );
    return res.rows[0]?.handle;
};

export const getRecentClones = async () => {
    const res = await executeQuery(
        `SELECT * FROM sim_users ORDER BY created_at DESC LIMIT 30`
    );
    return res.rows;
};

export const getEventsByHandle = async (handle: string) => {
    const res = await executeQuery(
        `
    SELECT 
      sae.*,
      st.id as agent_tweet_id 
    FROM sim_action_events sae
    LEFT JOIN sim_agent_tweets st ON st.action_id = sae.id
    WHERE sae.from_handle = $1 OR sae.to_handle = $1
    ORDER BY sae.created_at DESC
  `,
        [handle]
    );
    return res.rows;
};