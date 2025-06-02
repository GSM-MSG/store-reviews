import { ReviewNotifier } from "./feature/appstore/review-notifier";
import { loadConfig } from "./shared/utils";
import {playStore} from "./feature/playstore/playstore";

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
  if(false) {
    const bot = new StoreReviewsBot();
    await bot.runOnce();
  } else {
    playStore();
  }

}

main().catch(console.error);
