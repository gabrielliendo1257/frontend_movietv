import { TestBed } from '@angular/core/testing';

import { UploadSessionPersistence } from './upload-session-persistence';

describe('UploadSessionPersistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('persiste metadata y fingerprint sin abrir IndexedDB', () => {
        const persistence = TestBed.inject(UploadSessionPersistence);
        const open = spyOn(indexedDB, 'open');

        persistence.savePending({
            idempotencyKey: 'idem-4',
            addMediaId: 'add-4',
            movieId: null,
            fileFingerprint: {
                filename: 'video.mp4', size: 3_000_000_000,
                mimeType: 'video/mp4', lastModified: 789, addMediaId: 'add-4',
            },
            providerId: 4,
            draft: { title: 'Video' },
        });

        expect(open).not.toHaveBeenCalled();
        expect(persistence.loadPending()?.fileFingerprint.size).toBe(3_000_000_000);
    });

    it('elimina la base IndexedDB legacy una sola vez', () => {
        const deleteDatabase = spyOn(indexedDB, 'deleteDatabase').and.callThrough();

        TestBed.inject(UploadSessionPersistence);

        expect(deleteDatabase).toHaveBeenCalledWith('movieflix-uploads');
    });
});
