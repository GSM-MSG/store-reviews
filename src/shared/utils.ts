import * as fs from "fs";
import * as path from "path";
import { Config, Storage } from "../feature/appstore/types.js";
import { ReviewOrigins } from "./type/review-origins.js";
import {PlayStoreConfig} from "../feature/playstore/types.js";

export function loadPlayStoreConfig(): PlayStoreConfig {
  try {
    const configPath = path.join(process.cwd(), "playstore.config.json");
    const configData = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function loadConfig(): Config {
  try {
    const configPath = path.join(process.cwd(), "config.json");
    const configData = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function loadStorage({ origin }: { origin: ReviewOrigins }): Storage {
  try {
    const storagePath = `${
      origin == "appstore" ? "storage-appstore.json" : "storage-playstore.json"
    }`;
    const storageData = fs.readFileSync(storagePath, "utf-8");
    return JSON.parse(storageData);
  } catch (error) {
    console.error("Error:", error);
    return { processedReviews: {} };
  }
}

export function saveStorage({
  storage,
  origin,
}: {
  storage: Storage;
  origin: ReviewOrigins;
}): void {
  try {
    const storagePath = `${
      origin == "appstore" ? "storage-appstore.json" : "storage-playstore.json"
    }`;
    fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
