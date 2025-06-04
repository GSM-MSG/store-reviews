import {GoogleAuth} from "google-auth-library";
import axios from "axios";
import {PlayStoreReview, PlayStoreReviewsResponse} from "./playstore.types.js";

const BASE_URL = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications`;

const auth = new GoogleAuth({
    keyFile: "YOUR_KEY_FILE_PATH.json",
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

    // 특정 리뷰 상세 정보 가져오기 (옵션)
    async getReview(reviewId: string): Promise<PlayStoreReview> {
        try {
            const client = await auth.getClient();
            const accessToken = (await client.getAccessToken()).token;

            if (!accessToken) {
                throw new Error('Failed to obtain access token');
            }

            const url = `${BASE_URL}/${this.packageName}/reviews/${reviewId}`;
            const response = await axios.get<PlayStoreReview>(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching review:', error);
            throw new Error('Failed to fetch review from Google Play API');
        }
    }
}