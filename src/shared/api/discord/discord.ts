import {DiscordEmbed, DiscordWebhookPayload} from "../../../feature/appstore/types.js";
import axios from "axios";

export class DiscordApi {
    async sendReview(
        webhookURL: string,
        embed: DiscordEmbed,
    ): Promise<boolean> {
        try {
            const payload: DiscordWebhookPayload = {
                embeds: [embed],
            };

            await axios.post(webhookURL, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });

            return true;
        } catch (error) {
            console.error(`Failed to send review to Discord: ${error}`);
            return false;
        }
    }
}