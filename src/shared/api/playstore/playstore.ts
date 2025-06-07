import {GoogleAuth} from "google-auth-library";
import axios from "axios";
import {PlayStoreReviewsResponse} from "./playstore.types.js";

const BASE_URL = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications`;

const auth = new GoogleAuth({
    keyFile: "../playstore.config.json",
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
})

interface GetReviewsParams {
    maxResults?: number;
    pageToken?: string;
}

export class GooglePlayApi {
    private readonly packageName: string;

    constructor(packageName: string) {
        this.packageName = packageName;
    }

    async getReviews({maxResults = 100, pageToken}: GetReviewsParams): Promise<PlayStoreReviewsResponse> {
        try {
            const client = await auth.getClient();
            const accessToken = (await client.getAccessToken()).token;

            if (!accessToken) {
                throw new Error('Failed to obtain access token');
            }

            const url = `${BASE_URL}/${this.packageName}/reviews`;
            const response = await axios.get<PlayStoreReviewsResponse>(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    maxResults,
                    token: pageToken,
                },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw new Error('Failed to fetch reviews from Google Play API');
        }
    }
}