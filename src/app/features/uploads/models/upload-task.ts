import { MovieMetadata } from '@features/uploads/models/movie-metadata';

export type UploadState =
    | 'idle'
    | 'resuming'
    | 'requesting_session'
    | 'uploading'
    | 'persisting'
    | 'confirming'
    | 'completed'
    | 'error'
    | 'cancelled';

export const ACTIVE_UPLOAD_STATES: ReadonlySet<UploadState> = new Set<UploadState>([
    'resuming',
    'requesting_session',
    'uploading',
    'persisting',
    'confirming',
]);

export interface UploadTask {
    uploadId: string;
    file: File | null;
    fileName: string;
    progress: number;
    state: UploadState;
    uploadUrl: string;
    storageKey: string;
    metadata: MovieMetadata;
    error?: string | null;
}
