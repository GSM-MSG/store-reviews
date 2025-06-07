interface DeviceMetadata {
    productName?: string;
    manufacturer?: string;
    deviceClass?: string;
    screenWidthPx: number;
    screenHeightPx: number;
    nativePlatform: string;
    screenDensityDpi: number;
    glEsVersion: number;
    ramMb: number;
}

type Timestamp = {
    seconds: string;
    nanos: number;
}

interface UserComment {
    text: string;
    lastModified: Timestamp;
    starRating: number;
    reviewerLanguage?: string;
    device?: string;
    androidOsVersion?: number;
    appVersionCode?: number;
    appVersionName?: string;
    deviceMetadata?: DeviceMetadata;

}

interface DeveloperComment {
    text: string,
    lastModified: Timestamp,
}

type Comment =
    | { userComment: UserComment; developerComment?: never }
    | { userComment?: never; developerComment: DeveloperComment };

export interface PlayStoreReview {
    reviewId: string;
    authorName: string;
    comments: Comment[];
}

export interface PlayStoreReviewsResponse {
    reviews: PlayStoreReview[];
    nextPageToken?: string;
}