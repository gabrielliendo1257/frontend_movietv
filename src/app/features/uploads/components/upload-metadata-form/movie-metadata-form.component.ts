import {Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MovieMetadata} from '@features/uploads/components/upload-panel/movie-data';
import {UploadFacade} from '@features/uploads/services/upload-facade';

function emptyMovie(): MovieMetadata {
    return {
        id: 0, title: '', originalTitle: '', year: null, genres: [],
        popularity: 5, duration: '', director: '', cast: [],
        overview: '', poster_path: '', release_date: '',
        country: '', language: '', awards: []
    };
}

@Component({
    selector: 'app-movie-metadata-form',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './movie-metadata-form.component.html',
    styleUrls: ['./movie-metadata-form.component.css']
})
export class MovieMetadataFormComponent {
    private readonly uploadFacade = inject(UploadFacade);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    movieData = input<MovieMetadata | null>(null);

    openSearch = output<void>();
    emittedFileSelected = output<File>();
    uploadRequested = output<void>();

    readonly progress = this.uploadFacade.progress;
    readonly error = this.uploadFacade.error;
    readonly uploadState = this.uploadFacade.state;

    readonly formMovie = signal<MovieMetadata>(emptyMovie());
    readonly fileSelected = signal<File | null>(null);

    readonly isUploading =
        computed(() => {
            const state = this.uploadState();

            return (
                state === 'requesting_session'
                || state === 'uploading'
                || state === 'confirming'
                || state === 'persisting'
            );
        });

    // Temp inputs for chips
    genreInput = '';
    castInput = '';
    awardInput = '';

    // UI state
    activeTab: 'form' | 'preview' = 'form';

    constructor() {
        effect(() => {
            const data = this.movieData();
            if (data) {
                this.formMovie.set({...data});
            }
        });
    }

    get m(): MovieMetadata {
        return this.formMovie();
    }

    get ratingStars(): number[] {
        return Array.from({length: 10}, (_, i) => i + 1);
    }

    setRating(event: Event): void {
        let eventValue = (event.target as HTMLInputElement).value
        this.formMovie.update(m => ({...m, popularity: Number(eventValue)}));
    }

    updateField<K extends keyof MovieMetadata>(key: K, value: MovieMetadata[K]): void {
        this.formMovie.update(m => ({...m, [key]: value}));
    }

    addGenre(): void {
        const val = this.genreInput.trim();
        if (val) {
            this.formMovie.update(m =>
                ({
                    ...m,
                    genres: {...m.genres}
                })
            );
        }
        this.genreInput = '';
    }

    removeGenre(i: number): void {
        this.formMovie.update(m => ({...m, genres: m.genres.filter((_, idx) => idx !== i)}));
    }

    addCast(): void {
        const val = this.castInput.trim();
        if (val) {
            this.formMovie.update(m => ({...m, cast: [...m.cast, val]}));
        }
        this.castInput = '';
    }

    removeCast(i: number): void {
        this.formMovie.update(m => ({...m, cast: m.cast.filter((_, idx) => idx !== i)}));
    }

    addAward(): void {
        const val = this.awardInput.trim();
        if (val) {
            this.formMovie.update(m => ({...m, awards: [...m.awards, val]}));
        }
        this.awardInput = '';
    }

    removeAward(i: number): void {
        this.formMovie.update(m => ({...m, awards: m.awards.filter((_, idx) => idx !== i)}));
    }

    roundRating(val: number): number {
        return Math.round(val);
    }

    switchTab(tab: 'form' | 'preview'): void {
        this.activeTab = tab;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        this.fileSelected.set(file);
        this.emittedFileSelected.emit(file);
        input.value = '';
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    selectFile(): void {
        this.fileInput.nativeElement.click();
    }

    startUpload(): void {
        this.uploadRequested.emit()
    }
}
