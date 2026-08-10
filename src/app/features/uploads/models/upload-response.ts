export type UploadObjectStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'DELETED';

export interface ExpectedObjectData {
    expectedSize: number;
    expectedMime: string;
}

export interface UploadSessionDto {
    uploadId: string;
    uploadUrl: string;
    storageKey: string;
    method: 'PUT' | 'POST';
    status: UploadObjectStatus;
    object: ExpectedObjectData;
}