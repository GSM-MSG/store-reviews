import {PlayStoreReview, PlayStoreReviewsResponse} from "../../shared/api/playstore/playstore.types.js";
import {GooglePlayApi} from "../../shared/api/playstore/playstore.js";
import {loadStorage} from "../../shared/utils.js";
import {DiscordEmbed} from "../appstore/types.js";
import {DiscordApi} from "../../shared/api/discord/discord.js";
import {delay} from "../../shared/utils/async.js";
import {DiscordUtils} from "../../shared/utils/discord.js";
import {timestampToDate} from "../../shared/utils/timestamp-to-date.js";
import {generateStarEmoji} from "../../shared/utils/generate-star-emoji.js";

export class PlayStoreReviewBot {
    private readonly packageName: string
    private readonly discordWebhookUrl: string

    constructor({packageName, discordWebhookUrl}: { packageName: string, discordWebhookUrl: string }) {
        this.packageName = packageName;
        this.discordWebhookUrl = discordWebhookUrl;
    }

    async getPlayStoreReviews({packageName, maxResults}: {
        packageName: string,
        maxResults?: number
    }): Promise<PlayStoreReviewsResponse> {
        const api = new GooglePlayApi(packageName);
        return await api.getReviews({maxResults: maxResults || 100});
    }

    async sendReview(
        webhookURL: string,
        review: PlayStoreReview,
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
        reviews: PlayStoreReview[],
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

    makeReviewEmbed(
        review: PlayStoreReview,
        appName: string
    ): DiscordEmbed {
        const {authorName, comments} = review;
        const userComments = comments
            .filter(comment => comment.userComment)
            .map(comment => comment.userComment!);

        const latestUserComment = userComments[userComments.length - 1];
        const {
            starRating,
            text,
            reviewerLanguage,
            appVersionCode,
            appVersionName,
            androidOsVersion,
            lastModified,
            deviceMetadata,
        } = latestUserComment;

        return {
            title: `${text}`,
            description: `@${appName} (${appVersionName} + ${appVersionCode})`,
            color: DiscordUtils.getRatingColor(starRating),
            fields: [
                {
                    name: "별점",
                    value: `${generateStarEmoji(starRating)} - ️️(${starRating}/5)`,
                    inline: true,
                },
                {
                    name: "유저",
                    value: `@${authorName || 'Unknown'} (${reviewerLanguage ?? 'Unknown'})`,
                    inline: true,
                },
                {
                    name: '구동 환경',
                    value: `Android OS Version: ${androidOsVersion} 기종: ${deviceMetadata?.manufacturer} - ${deviceMetadata?.productName}`,
                    inline: true
                }
            ],
            timestamp: timestampToDate(lastModified).toISOString(),
        };
    }

    async runOnce() {
        const response = await this.getPlayStoreReviews({packageName: this.packageName});
        const reviews = response.reviews;
        if (reviews.length === 0) {
            return;
        }
        const storage = loadStorage({origin: 'playstore'});
        const processedReviewIds =
            storage.processedReviews[this.packageName] || [];

        const newReviews = reviews.filter(
            (review) => !processedReviewIds.includes(review.reviewId)
        );

        if (newReviews.length === 0) {
            return;
        }

        const sentCount = await this.sendReviews(
            this.discordWebhookUrl,
            newReviews,
            this.packageName
        );

        if (sentCount > 0) {
            const newProcessedIds = newReviews.map((review) => review.reviewId);
            storage.processedReviews[this.packageName] = [
                ...processedReviewIds,
                ...newProcessedIds,
            ];
        }
    }
}