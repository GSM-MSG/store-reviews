import {GooglePlayApi} from "../../shared/api/playstore/playstore.js";

export async function getPlayStoreReviews(): Promise<void> {
    const api = new GooglePlayApi("com.onmi.aos");
    const reviews = await api.getReviews({maxResults: 100});
    const review = await api.getReview(reviews.reviews[0].reviewId);
}