import { Component, inject, signal } from '@angular/core';
import { MovieSearchModalComponent } from '@features/uploads/components/upload-panel/movie-search-modal.component';
import { MovieMetadataFormComponent } from '@features/uploads/components/upload-metadata-form/movie-metadata-form.component';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { MovieMetadata } from '@features/uploads/components/upload-panel/movie-data';

@Component({
    selector: 'app-upload-page',
    imports: [MovieMetadataFormComponent, MovieSearchModalComponent],
    templateUrl: './upload-page.html',
    styleUrl: './upload-page.css',
})
export class UploadPage {
    uploadFacade = inject(UploadFacade);

    movieModalIsOpen = signal(false);
    receiverSelectedFile = signal<File | null>(null);
    selectedMovie = signal<MovieMetadata | null>(null);

    onMovieSelected(movie: MovieMetadata): void {
        this.selectedMovie.set(movie);
    }

    startUpload(): void {
        const file = this.receiverSelectedFile();
        const metadata = this.selectedMovie();
        if (!file || !metadata) return;

        this.uploadFacade.uploadMovie(file);
    }
}
