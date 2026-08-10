import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormControlStatus, ReactiveFormsModule } from '@angular/forms';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { MovieDraftStore } from '@features/uploads/services/movie-draft-store';
import { MovieSearchModal } from '../movie-search-modal/movie-search-modal';
import { ChipsInput } from '../chips-input/chips-input';
import { UploadSessionPersistence } from '@features/uploads/services/upload-session-persistence';

@Component({
    selector: 'app-movie-metadata-form',
    standalone: true,
    imports: [ReactiveFormsModule, MovieSearchModal, ChipsInput],
    templateUrl: './movie-metadata-form.component.html',
    styleUrl: './movie-metadata-form.component.css'
})
export class MovieMetadataFormComponent {
    private readonly uploadFacade = inject(UploadFacade);
    private readonly draftStore = inject(MovieDraftStore);
    private readonly fileStorage = inject(UploadSessionPersistence);

    readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    readonly searchModalIsOpen = signal(false);

    onUploadSucceeded = input<() => void>();
    onUploadFailed = input<(message: string) => void>();

    readonly progress = this.uploadFacade.progress;
    readonly error = this.uploadFacade.error;
    readonly uploadState = this.uploadFacade.state;

    readonly form = this.draftStore.form;
    readonly controls = this.draftStore.controls;

    readonly popularity = this.form.controls.popularity;

    readonly fileSelected = signal<File | null>(null);

    private readonly formStatus = signal<FormControlStatus>('INVALID');

    constructor() {
        this.formStatus.set(this.form.status);

        this.form.statusChanges
            .pipe(takeUntilDestroyed())
            .subscribe((status) => this.formStatus.set(status));

        this.restoreDraftFile();

        effect(() => {
            if (this.uploadState() === 'completed') {
                this.onUploadSucceeded()?.();
                this.draftStore.reset();
                this.clearSelectedFile();
            } else if (this.uploadState() === 'error') {
                this.onUploadFailed()?.(this.error() ?? 'Upload failed.');
            }
        });
    }

    readonly isUploading = computed(() => {
        const state = this.uploadState();

        return (
            state === 'resuming'
            || state === 'requesting_session'
            || state === 'uploading'
            || state === 'confirming'
            || state === 'persisting'
        );
    });

    readonly canUpload = computed(() => !!this.fileSelected() && this.formStatus() === 'VALID');

    // UI state
    activeTab: 'form' | 'preview' = 'form';

    get m(): MovieMetadata {
        return this.form.getRawValue();
    }

    get ratingStars(): number[] {
        return Array.from({ length: 10 }, (_, i) => i + 1);
    }

    setRating(value: number): void {
        this.popularity.setValue(value);
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
        void this.fileStorage.saveDraftFile(file).catch(() => undefined);
        input.value = '';
    }

    onPosterError(): void {
        this.form.controls.poster_path.setValue('');
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    selectFile(): void {
        this.fileInput()?.nativeElement.click();
    }

    startUpload(): void {
        const file = this.fileSelected();
        if (!file) return;

        this.uploadFacade.uploadMovie(file, this.form.getRawValue());
    }

    openSearchModal(): void {
        this.searchModalIsOpen.set(true);
    }

    onMovieSelected(movie: MovieMetadata): void {
        this.draftStore.patchFromMovie(movie);
        this.searchModalIsOpen.set(false);
    }

    clearForm(): void {
        this.draftStore.reset();
        this.clearSelectedFile();
        this.searchModalIsOpen.set(false);
    }

    private restoreDraftFile(): void {
        void this.fileStorage.loadDraftFile().then((file) => {
            if (file) {
                this.fileSelected.set(file);
            }
        });
    }

    private clearSelectedFile(): void {
        this.fileSelected.set(null);
        void this.fileStorage.clearDraftFile().catch(() => undefined);
    }
}