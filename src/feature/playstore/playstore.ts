import {GoogleAuth} from "google-auth-library";
import {PlayStoreReview, ReviewsResponse} from "../../shared/api/playstore.types";
import axios from "axios";

const BASE_URL = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications`;
const auth = new GoogleAuth({
    keyFile: "",
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
})

interface GetReviewsParams {
    packageName: string;
    maxResults?: number;
    pageToken?: string;
}

export class GooglePlayApi {
    private readonly packageName: string;

    constructor(packageName: string) {
        this.packageName = packageName;
    }

    // 리뷰 목록 가져오기
    async getReviews({ maxResults = 100, pageToken }: GetReviewsParams): Promise<ReviewsResponse> {
        try {
            // Google Auth 클라이언트로 액세스 토큰 가져오기
            const client = await auth.getClient();
            const accessToken = (await client.getAccessToken()).token;

            if (!accessToken) {
                throw new Error('Failed to obtain access token');
            }

            const url = `${BASE_URL}/${this.packageName}/reviews`;
            const response = await axios.get<ReviewsResponse>(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    maxResults,
                    token: pageToken,
                },
            });

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