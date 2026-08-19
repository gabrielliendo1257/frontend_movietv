export interface UserProfile {
    id: string;
    username: string;
    email: string;
    plan: string;
    enabled: boolean;
    violations: number;
    blocked: boolean;
}

export interface QuotaSnapshot {
    ownerUsername: string;
    quotaBytes: number;
    usedBytes: number;
    remainingBytes: number;
}

export interface UploadListItem {
    storageId: number;
    objectKey: string;
    status: string;
    sizeInBytes: number;
    createdAt: string;
}

export interface HomeView {
    profile: UserProfile;
    quota: QuotaSnapshot;
    recentUploads: UploadListItem[];
}