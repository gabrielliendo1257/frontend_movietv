export type UploadState =
    | 'idle'
    | 'requesting_session'
    | 'uploading'
    | 'persisting'
    | 'confirming'
    | 'completed'
    | 'error';

export interface UploadTask {
    uploadId: string;
    file: File;
    fileName: string;
    progress: number;
    state: UploadState;
    uploadUrl: string;
    storageKey: string;
}
