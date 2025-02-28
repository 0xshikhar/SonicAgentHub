import axios from "axios";

/**
 * Posts an error message to a Discord webhook for monitoring and alerting
 * @param message The error message to post to Discord
 * @returns Promise that resolves when the message is posted
 */
export async function postErrorToDiscord(message: string): Promise<void> {
  try {
    const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured. Error not posted to Discord.");
      return;
    }
    
    await axios.post(webhookUrl, {
      content: message,
      username: "Agent Chain Error Bot",
      avatar_url: "https://i.imgur.com/4M34hi2.png" // Optional: Add a custom avatar
    });
    
    console.log("Error posted to Discord successfully");
  } catch (error) {
    console.error("Failed to post error to Discord:", error);
  }
} 