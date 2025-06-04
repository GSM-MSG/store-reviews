import axios from "axios";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import {AppStoreConnectConfig, AppStoreResponse, AppStoreReview,} from "./types.js";

export class AppStoreAPI {
    private baseURL = "https://api.appstoreconnect.apple.com/v1";
    private authConfig?: AppStoreConnectConfig;

    constructor(authConfig?: AppStoreConnectConfig) {
        this.authConfig = authConfig;
    }

    private generateJWT(): string | null {
        if (!this.authConfig) {
            return null;
        }

        try {
            const privateKeyPath = path.resolve(this.authConfig.privateKeyPath);

            if (!fs.existsSync(privateKeyPath)) {
                console.error(`Private key 파일을 찾을 수 없습니다: ${privateKeyPath}`);
                return null;
            }

            const privateKey = fs.readFileSync(privateKeyPath, "utf8");

            const now = Math.floor(Date.now() / 1000);
            const payload = {
                iss: this.authConfig.issuerId,
                iat: now,
                exp: now + 20 * 60,
                aud: "appstoreconnect-v1",
            };

            const token = jwt.sign(payload, privateKey, {
                algorithm: "ES256",
                keyid: this.authConfig.keyId,
            });

            return token;
        } catch (error) {
            console.error(`Failed to generate JWT : ${error}`);
            return null;
        }
    }

    async getReviews(
        appID: string,
        limit: number = 100
    ): Promise<AppStoreReview[]> {
        try {
            const apiReviews = await this.getReviewsFromAPI(appID, limit);
            if (apiReviews.length > 0) {
                return apiReviews;
            }
        } catch (error) {
            console.error(`Failed to get reviews from API: ${error}`);
        }

        return this.getReviewsFromRSS(appID);
    }

    private async getReviewsFromAPI(
        appID: string,
        limit: number = 100
    ): Promise<AppStoreReview[]> {
        try {
            const token = this.generateJWT();
            if (!token) {
                throw new Error("Failed to generate JWT");
            }

            const url = `${this.baseURL}/apps/${appID}/customerReviews`;
            const params = {
                limit: limit,
                sort: "-createdDate",
                "fields[customerReviews]":
                    "rating,title,body,reviewerNickname,createdDate,territory",
            };

            const response = await axios.get<AppStoreResponse>(url, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                timeout: 30000,
            });

            if (response.data && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error("Invalid JWT token");
                } else if (error.response?.status === 403) {
                    throw new Error("Access denied");
                } else if (error.response?.status === 404) {
                    throw new Error(`App ID ${appID} not found`);
                } else {
                    throw new Error(
                        `App Store Connect API error: ${error.response?.status} ${error.response?.statusText}`
                    );
                }
            } else {
                throw new Error(`App Store Connect API network error: ${error}`);
            }
        }
    }

    private async getReviewsFromRSS(appID: string): Promise<AppStoreReview[]> {
        try {
            const countries = ["kr", "us", "jp"];

            for (const country of countries) {
                try {
                    const rssUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${appID}/sortBy=mostRecent/json`;

                    const response = await axios.get(rssUrl, {
                        headers: {
                            Accept: "application/json",
                        },
                        timeout: 30000,
                    });

                    if (response.data && response.data.feed && response.data.feed.entry) {
                        const entries = response.data.feed.entry;

                        const reviewEntries =
                            entries.length > 1 && entries[0]["im:name"]
                                ? entries.slice(1)
                                : entries;

                        if (reviewEntries.length === 0) {
                            continue;
                        }

                        const reviews: AppStoreReview[] = reviewEntries.map(
                            (entry: any, index: number) => ({
                                id:
                                    entry.id?.label ||
                                    `rss-${country}-${appID}-${index}-${Date.now()}`,
                                type: "customerReviews",
                                attributes: {
                                    rating: parseInt(entry["im:rating"]?.label || "0"),
                                    title: entry.title?.label || "Untitled",
                                    body: entry.content?.label || "No content",
                                    reviewerNickname: entry.author?.name?.label || "Anonymous",
                                    createdDate: entry.updated?.label || new Date().toISOString(),
                                    territory: country.toUpperCase(),
                                },
                            })
                        );

                        return reviews;
                    }
                } catch (countryError) {
                    console.error(
                        `Failed to get reviews from ${country}: ${countryError}`
                    );
                    continue;
                }
            }

            return [];
        } catch (error) {
            console.error(`Failed to get reviews from RSS: ${error}`);
            return [];
        }
    }

    validateConfig(): boolean {
        if (!this.authConfig) {
            return false;
        }

        const {keyId, issuerId, privateKeyPath} = this.authConfig;

        if (!keyId || keyId === "") {
            console.error("App Store Connect Key ID is not set");
            return false;
        }

        if (!issuerId || issuerId === "") {
            console.error("App Store Connect Issuer ID is not set");
            return false;
        }

        const fullPath = path.resolve(privateKeyPath);
        if (!fs.existsSync(fullPath)) {
            console.error(`Private key file not found: ${fullPath}`);
            return false;
        }

        console.log("App Store Connect configuration is valid");
        return true;
    }
}
