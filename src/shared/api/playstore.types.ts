export interface PlayStoreReview {
    reviewId: string;
    authorName: string;
    comments: Array<{
        userComment: {
            text: string;
            starRating: number;
            lastModified: string;
        };
    }>;
}

export interface ReviewsResponse {
    reviews: PlayStoreReview[];
    nextPageToken?: string;
}