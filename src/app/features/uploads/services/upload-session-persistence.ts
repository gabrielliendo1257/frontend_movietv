import { inject, Injectable } from '@angular/core';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { UploadSessionDto } from '@features/uploads/models/upload-response';

const SESSION_STORAGE_KEY = 'pending-upload-session';
const DB_NAME = 'movieflix-uploads';
const STORE_NAME = 'files';
const DRAFT_FILE_KEY = 'draft-file';

export interface PendingUpload {
    session: UploadSessionDto;
    fileName: string;
    stage: 'uploading' | 'closing_session' | 'confirming';
    metadata: MovieMetadata;
    movieId?: number;
}

@Injectable({
    providedIn: 'root',
})
export class UploadSessionPersistence {
    saveSession(pending: PendingUpload): void {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(pending));
    }

    loadSession(): PendingUpload | null {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw) as PendingUpload;
        } catch {
            this.clear();
            return null;
        }
    }

    clear(): void {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);

        localStorage.removeItem(SESSION_STORAGE_KEY);

        if (!raw) return;

        try {
            const uploadId = (JSON.parse(raw) as PendingUpload).session.uploadId;
            void this.deleteFile(uploadId);
        } catch {
            return;
        }
    }

    removeSession(): void {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    saveFile(uploadId: string, file: File): Promise<void> {
        return this.withStore<void>((store) => store.put(file, uploadId));
    }

    loadFile(uploadId: string): Promise<File | null> {
        return this.withStore<File | undefined>((store) => store.get(uploadId)).then((file) => file ?? null);
    }

    saveDraftFile(file: File): Promise<void> {
        return this.withStore<void>((store) => store.put(file, DRAFT_FILE_KEY));
    }

    loadDraftFile(): Promise<File | null> {
        return this.withStore<File | undefined>((store) => store.get(DRAFT_FILE_KEY)).then((file) => file ?? null);
    }

    clearDraftFile(): Promise<void> {
        return this.withStore<void>((store) => store.delete(DRAFT_FILE_KEY));
    }

    deleteFile(uploadId: string): Promise<void> {
        return this.withStore<void>((store) => store.delete(uploadId));
    }

    private withStore<T>(operation: (store: IDBObjectStore) => IDBRequest<any>): Promise<T> {
        return this.openDb().then(
            (db) =>
                new Promise<T>((resolve, reject) => {
                    const transaction = db.transaction(STORE_NAME, 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);

                    const request = operation(store);

                    request.onsuccess = () => resolve(request.result as T);
                    request.onerror = () => reject(request.error);
                }),
        );
    }

    private openDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = () => {
                request.result.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}