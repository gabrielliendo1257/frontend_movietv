import { Component, inject } from '@angular/core';
import { MovieMetadataFormComponent } from '@features/uploads/components/upload-metadata-form/movie-metadata-form.component';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-upload-page',
    imports: [MovieMetadataFormComponent],
    templateUrl: './upload-page.html',
    styleUrl: './upload-page.css',
})
export class UploadPage {
    private readonly toastService = inject(ToastService);

    notifyUploadSucceeded = () => {
        this.toastService.success('Movie uploaded successfully.');
    };

    notifyUploadFailed = (message: string) => {
        this.toastService.error(message);
    };
}