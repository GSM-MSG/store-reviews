import { ReviewNotifier } from "./feature/appstore/review-notifier.js";
import { loadConfig } from "./shared/utils.js";
import { PlayStoreReviewBot } from "./feature/playstore/play-store-review-bot.js";

class StoreReviewsBot {
  private reviewNotifier: ReviewNotifier;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.reviewNotifier = new ReviewNotifier(this.config);
  }

  async runOnce(): Promise<void> {
    try {
      if (!this.config.apps || this.config.apps.length === 0) {
        console.log("config.json을 확인해주세요.");
        return;
      }

      this.reviewNotifier.validateConfiguration();

      await this.reviewNotifier.checkAllApps(this.config.apps);

      console.log("✅ Successfully notified Store Reviews");
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

async function main() {
    const playStoreBot = new PlayStoreReviewBot({
      packageName: "packageName",
      discordWebhookUrl: "discordWebhookUrl",
    });
    await playStoreBot.runOnce();

  const appStoreBot = new StoreReviewsBot();
  await appStoreBot.runOnce();
}

main().catch(console.error);
