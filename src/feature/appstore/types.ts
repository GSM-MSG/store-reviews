export interface AppStoreConnectConfig {
    keyId: string;
    issuerId: string;
    privateKeyPath: string;
}

export interface AppConfig {
    appId: string;
    appName: string;
    discordWebhookUrl: string;
}

export interface Config {
    appStoreConnect: AppStoreConnectConfig;
    apps: AppConfig[];
}

export interface Storage {
    processedReviews: Record<string, string[]>;
}

export interface AppStoreReview {
    id: string;
    type: string;
    attributes: {
        rating: number;
        title: string;
        body: string;
        reviewerNickname: string;
        createdDate: string;
        territory: string;
    };
}

export interface AppStoreResponse {
    data: AppStoreReview[];
    links?: {
        self?: string;
        next?: string;
    };
    meta?: {
        paging?: {
            total: number;
            limit: number;
        };
    };
}

export interface DiscordEmbed {
    title: string;
    description: string;
    color: number;
    fields: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    timestamp: string;
    footer?: {
        text: string;
    };
}

export interface DiscordWebhookPayload {
    embeds: DiscordEmbed[];
}
