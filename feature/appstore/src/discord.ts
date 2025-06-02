import axios from "axios";
import { AppStoreReview, DiscordEmbed, DiscordWebhookPayload } from "./types";

export class DiscordNotifier {
  async sendReview(
    webhookURL: string,
    review: AppStoreReview,
    appName: string
  ): Promise<boolean> {
    try {
      const embed = this.makeReviewEmbed(review, appName);
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

      await this.delay(1000);
    }

    return successCount;
  }

  private makeReviewEmbed(
    review: AppStoreReview,
    appName: string
  ): DiscordEmbed {
    const { rating, title, body, reviewerNickname, createdDate, territory } =
      review.attributes;

    const fullStars = "⭐".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);

    const ratingText = fullStars + emptyStars;

    return {
      title: `${appName}`,
      description: "---",
      color: getRatingColor(rating),
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
          value: truncateText(title, 1024),
          inline: false,
        },
        {
          name: "내용",
          value: truncateText(body, 1024),
          inline: false,
        },
      ],
      timestamp: new Date(createdDate).toISOString(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function getRatingColor(rating: number): number {
  if (rating >= 4) return 0x00ff00; // green
  if (rating >= 3) return 0xffff00; // yellow
  if (rating >= 2) return 0xff8800; // orange
  return 0xff0000; // red
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
