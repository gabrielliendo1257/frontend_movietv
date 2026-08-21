import { Component, inject, input, model, output } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { WebMovie } from '@features/movies/models/web-movie';
import { MovieUpdateRequest } from '@features/movies/models/movie-update';
import { MediaForm, MediaFormValue } from '@features/movies/components/media-form/media-form';

@Component({
    selector: 'app-media-edit-modal',
    imports: [MediaForm],
    templateUrl: './media-edit-modal.html',
    styleUrl: './media-edit-modal.css',
})
export class MediaEditModal {
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly toast = inject(ToastService);

    readonly isOpen = model(false);
    readonly movie = input<WebMovie | null>(null);

    readonly saved = output<WebMovie>();

    readonly saving = input(false);

    onSave(value: MediaFormValue): void {
        const movie = this.movie();
        if (!movie) return;
        const m = value.metadata;
        const request: MovieUpdateRequest = {
            title: m.title,
            originalTitle: m.originalTitle,
            year: m.year,
            genres: m.genres,
            duration: m.duration,
            director: m.director,
            cast: m.cast,
            overview: m.overview,
            poster_path: m.poster_path,
            release_date: m.release_date,
            country: m.country,
            language: m.language,
            awards: m.awards,
            popularity: m.popularity,
        };
        this.movieProviderService.update(movie.id, request).subscribe({
            next: (updated) => {
                this.toast.success('Metadata actualizada.');
                this.saved.emit(updated);
                this.isOpen.set(false);
            },
            error: () => this.toast.error('No se pudo actualizar la metadata.'),
        });
    }

    close(): void {
        this.isOpen.set(false);
    }
}
