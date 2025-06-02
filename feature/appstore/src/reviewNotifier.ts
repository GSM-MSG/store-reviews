import { AppStoreAPI } from "./appstore.js";
import { DiscordNotifier } from "./discord.js";
import { AppConfig, Config } from "./types.js";
import { loadStorage, saveStorage } from "./utils.js";

export class ReviewNotifier {
  private appStoreAPI: AppStoreAPI;
  private discordNotifier: DiscordNotifier;

  constructor(config: Config) {
    this.appStoreAPI = new AppStoreAPI(config.appStoreConnect);
    this.discordNotifier = new DiscordNotifier();
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

      const sentCount = await this.discordNotifier.sendReviews(
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
}
