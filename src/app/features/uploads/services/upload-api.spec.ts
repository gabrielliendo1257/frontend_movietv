import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { UploadApiService } from './upload-api-service';

describe('UploadApi', () => {
  let service: UploadApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(UploadApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
