import {AppStoreAPI} from "./appstore.js";
import {AppConfig, AppStoreReview, Config, DiscordEmbed} from "./types.js";
import {loadStorage, saveStorage} from "../../shared/utils.js";
import {DiscordApi} from "../../shared/api/discord/discord.js";
import {delay} from "../../shared/utils/async.js";
import {DiscordUtils} from "../../shared/utils/discord.js";

export class ReviewNotifier {
    private appStoreAPI: AppStoreAPI;

    constructor(config: Config) {
        this.appStoreAPI = new AppStoreAPI(config.appStoreConnect);
    }

    async checkReviewsForApp(appConfig: AppConfig): Promise<void> {
        try {
            console.log(`\n=== ${appConfig.appName} ===`);

            const storage = loadStorage();
            const processedReviewIds =
                storage.processedReviews[appConfig.appId] || [];

            const reviews = await this.appStoreAPI.getReviews(appConfig.appId);

            if (reviews.length === 0) {
                return;
            }

            const newReviews = reviews.filter(
                (review) => !processedReviewIds.includes(review.id)
            );

            if (newReviews.length === 0) {
                return;
            }

            const sentCount = await this.sendReviews(
                appConfig.discordWebhookUrl,
                newReviews,
                appConfig.appName
            );

            if (sentCount > 0) {
                const newProcessedIds = newReviews
                    .slice(0, sentCount)
                    .map((review) => review.id);
                storage.processedReviews[appConfig.appId] = [
                    ...processedReviewIds,
                    ...newProcessedIds,
                ];

                if (storage.processedReviews[appConfig.appId].length > 1000) {
                    storage.processedReviews[appConfig.appId] =
                        storage.processedReviews[appConfig.appId].slice(-1000);
                }

                saveStorage(storage);
            }
        } catch (error) {
            console.error(`Error ${appConfig.appName}:`, error);
        }
    }

    async checkAllApps(apps: AppConfig[]): Promise<void> {
        for (const app of apps) {
            await this.checkReviewsForApp(app);

            if (apps.length > 1) {
                await this.delay(2000);
            }
        }
    }

    validateConfiguration(): boolean {
        return this.appStoreAPI.validateConfig();
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async sendReview(
        webhookURL: string,
        review: AppStoreReview,
        appName: string
    ): Promise<boolean> {
        try {
            const embed = this.makeReviewEmbed(review, appName);
            const api = new DiscordApi();
            await api.sendReview(webhookURL, embed);
            return true;
        } catch (error) {
            console.error(`Failed to send review to Discord: ${error}`);
            return false;
        }
    }

    async sendReviews(
        webhookURL: string,
        reviews: AppStoreReview[],
        appName: string
    ): Promise<number> {
        let successCount = 0;

        for (const review of reviews) {
            const success = await this.sendReview(webhookURL, review, appName);
            if (success) {
                successCount++;
            }

            await delay(1000);
        }

        return successCount;
    }

    private makeReviewEmbed(
        review: AppStoreReview,
        appName: string
    ): DiscordEmbed {
        const {rating, title, body, reviewerNickname, createdDate, territory} =
            review.attributes;

        const fullStars = "⭐".repeat(rating);
        const emptyStars = "☆".repeat(5 - rating);

        const ratingText = fullStars + emptyStars;

        return {
            title: `${appName}`,
            description: "---",
            color: DiscordUtils.getRatingColor(rating),
            fields: [
                {
                    name: "별점",
                    value: `${ratingText} (${rating}/5)`,
                    inline: true,
                },
                {
                    name: "작성자",
                    value: reviewerNickname,
                    inline: true,
                },
                {
                    name: "국가",
                    value: territory,
                    inline: true,
                },
                {
                    name: "제목",
                    value: DiscordUtils.truncateText(title, 1024),
                    inline: false,
                },
                {
                    name: "내용",
                    value: DiscordUtils.truncateText(body, 1024),
                    inline: false,
                },
            ],
            timestamp: new Date(createdDate).toISOString(),
        };
    }
}
