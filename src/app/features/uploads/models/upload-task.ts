export type UploadState =
    | 'idle'
    | 'resuming'
    | 'requesting_session'
    | 'uploading'
    | 'persisting'
    | 'confirming'
    | 'completed'
    | 'error';

export interface UploadTask {
    uploadId: string;
    file: File | null;
    fileName: string;
    progress: number;
    state: UploadState;
    uploadUrl: string;
    storageKey: string;
}
