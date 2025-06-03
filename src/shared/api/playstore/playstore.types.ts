interface DeviceMetadata {
    productName: string;
    manufacturer: string;
    deviceClass: string;
    screenWidthPx: number;
    screenHeightPx: number;
    nativePlatform: string;
    screenDensityDpi: number;
    glEsVersion: number;
    ramMb: number;
}

interface UserComment {
    text: string;
    lastModified: {
        seconds: string;
        nanos: number;
    };
    starRating: number;
    reviewerLanguage: string;
    device: string;
    androidOsVersion: number;
    appVersionCode: number;
    appVersionName: string;
    deviceMetadata: DeviceMetadata;
}

interface DeveloperComment {
    text: string,
    lastModified: {
        seconds: string;
        nanos: number;
    };
}

interface Comment {
    userComment: UserComment;
    developerReply?: DeveloperComment;
}

export interface PlayStoreReview {
    reviewId: string;
    authorName: string;
    comments: Comment[];
}

export interface PlayStoreReviewsResponse {
    reviews: PlayStoreReview[];
    nextPageToken?: string;
}