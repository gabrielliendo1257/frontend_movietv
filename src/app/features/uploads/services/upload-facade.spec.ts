import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AddMediaApi } from '@features/uploads/data-access/add-media-api';
import { UploadTask } from '@features/uploads/models/upload-task';
import { UploadSessionPersistence } from './upload-session-persistence';
import { UploadFacade } from './upload-facade';

describe('UploadFacade', () => {
  let service: UploadFacade;
  let addMediaApi: jasmine.SpyObj<AddMediaApi>;

  beforeEach(() => {
    addMediaApi = jasmine.createSpyObj<AddMediaApi>('AddMediaApi', ['status']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: AddMediaApi, useValue: addMediaApi },
        { provide: UploadSessionPersistence, useValue: { loadPending: () => null, clearPending: () => undefined } },
      ],
    });
    service = TestBed.inject(UploadFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('valida el fingerprint y consulta el proceso fresco sin iniciar otro alta', () => {
    const task: UploadTask = {
      uploadId: 'idem-1',
      addMediaId: 'add-1',
      movieId: 10,
      file: null,
      fileName: 'movie.mp4',
      fileFingerprint: {
        filename: 'movie.mp4',
        size: 3,
        mimeType: 'video/mp4',
        lastModified: 123,
        addMediaId: 'add-1',
      },
      progress: 0,
      state: 'waiting_for_file',
      metadata: {} as UploadTask['metadata'],
      kind: 'MOVIE',
    };
    service.tasks.set([task]);
    addMediaApi.status.and.returnValue(of({
      addMediaId: 'add-1', phase: 'READY', movieId: 10, uploadId: null, upload: null, failureCode: null,
    }));

    service.reselectFile('idem-1', new File(['abc'], 'movie.mp4', { type: 'video/mp4', lastModified: 123 }));

    expect(addMediaApi.status).toHaveBeenCalledWith('add-1');
    expect(service.taskById('idem-1')?.state).toBe('completed');
  });

  it('no continúa si el archivo no coincide con el fingerprint', () => {
    const task = {
      uploadId: 'idem-2', addMediaId: 'add-2', movieId: null, file: null, fileName: 'movie.mp4',
      fileFingerprint: { filename: 'movie.mp4', size: 3, mimeType: 'video/mp4', lastModified: 123, addMediaId: 'add-2' },
      progress: 0, state: 'waiting_for_file' as const, metadata: {} as UploadTask['metadata'], kind: 'MOVIE' as const,
    } satisfies UploadTask;
    service.tasks.set([task]);

    service.reselectFile('idem-2', new File(['different'], 'movie.mp4', { type: 'video/mp4', lastModified: 123 }));

    expect(addMediaApi.status).not.toHaveBeenCalled();
    expect(service.taskById('idem-2')?.state).toBe('waiting_for_file');
    expect(service.taskById('idem-2')?.error).toContain('archivo original');
  });
});
