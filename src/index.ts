import { ReviewNotifier } from "./feature/appstore/review-notifier.js";
import {loadConfig, loadPlayStoreConfig} from "./shared/utils.js";
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
  const origin = process.argv[2];
  if(origin === "playstore") {
    const playStoreConfig = loadPlayStoreConfig();
    const playStoreBot = new PlayStoreReviewBot({
      packageName: playStoreConfig.packageName,
      discordWebhookUrl: playStoreConfig.discordWebhookUrl,
    });
    await playStoreBot.runOnce();
  } else if (origin === "appstore") {
    const appStoreBot = new StoreReviewsBot();
    await appStoreBot.runOnce();
  }
}

main().catch(console.error);
