import { inject, Injectable } from '@angular/core';
import { InitialAccess, MovieDraft } from '@features/uploads/models/add-media';

const PENDING_KEY = 'pending-add-media';
const DB_NAME = 'movieflix-uploads';
const STORE_NAME = 'files';
const DRAFT_FILE_KEY = 'draft-file';

/** Proceso de alta pendiente de cerrar; sobrevive recargas de página. */
export interface PendingAddMedia {
    idempotencyKey: string;
    addMediaId: string | null;
    movieId: number | null;
    fileName: string;
    providerId: number;
    draft: MovieDraft;
    access?: InitialAccess;
}

@Injectable({ providedIn: 'root' })
export class UploadSessionPersistence {
    savePending(pending: PendingAddMedia): void {
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }

    loadPending(): PendingAddMedia | null {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw) as PendingAddMedia;
        } catch {
            this.removePending();
            return null;
        }
    }

    /** Solo borra el registro si sigue siendo el mismo proceso. */
    clearPending(idempotencyKey: string): void {
        if (this.loadPending()?.idempotencyKey !== idempotencyKey) return;
        this.removePending();
        void this.deleteFile(idempotencyKey).catch(() => undefined);
    }

    removePending(): void {
        localStorage.removeItem(PENDING_KEY);
    }

    saveFile(id: string, file: File): Promise<void> {
        return this.withStore<void>((store) => store.put(file, id));
    }

    loadFile(id: string): Promise<File | null> {
        return this.withStore<File | undefined>((store) => store.get(id)).then((file) => file ?? null);
    }

    deleteFile(id: string): Promise<void> {
        return this.withStore<void>((store) => store.delete(id));
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

    private withStore<T>(operation: (store: IDBObjectStore) => IDBRequest): Promise<T> {
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
