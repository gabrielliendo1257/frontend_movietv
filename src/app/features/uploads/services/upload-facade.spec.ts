import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { UploadFacade } from './upload-facade';

describe('UploadFacade', () => {
  let service: UploadFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(UploadFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
