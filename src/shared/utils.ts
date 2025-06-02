import * as fs from "fs";
import * as path from "path";
import { Config, Storage } from "../feature/appstore/types";

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

export function loadStorage(): Storage {
  try {
    const storagePath = path.join(process.cwd(), "storage.json");
    const storageData = fs.readFileSync(storagePath, "utf-8");
    return JSON.parse(storageData);
  } catch (error) {
    console.error("Error:", error);
    return { processedReviews: {} };
  }
}

export function saveStorage(storage: Storage): void {
  try {
    const storagePath = path.join(process.cwd(), "storage.json");
    fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
