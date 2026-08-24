import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { ToastService } from '@core/ui/toast.service';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { ACTIVE_UPLOAD_STATES } from '@features/uploads/models/upload-task';
import { MovieMetadata } from '@features/movies/models/movie-metadata';
import { UploadSessionPersistence } from '@features/uploads/services/upload-session-persistence';
import { MediaForm, MediaFormValue } from '@features/movies/components/media-form/media-form';
import { MovieSearchModal } from '@features/uploads/components/movie-search-modal/movie-search-modal';

const DRAFT_METADATA_KEY = 'movie-draft';

@Component({
    selector: 'app-upload-page',
    imports: [MediaForm, MovieSearchModal],
    templateUrl: './upload-page.html',
    styleUrl: './upload-page.css',
})
export class UploadPage {
    private readonly uploadFacade = inject(UploadFacade);
    private readonly toast = inject(ToastService);
    private readonly fileStorage = inject(UploadSessionPersistence);

    private readonly draftSubject = new Subject<MovieMetadata>();

    readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

    readonly file = signal<File | null>(null);
    readonly metadata = signal<MovieMetadata | null>(null);
    readonly searchOpen = signal(false);
    readonly taskId = signal<string | null>(null);

    readonly task = computed(() => {
        const id = this.taskId();
        return id ? this.uploadFacade.taskById(id) : null;
    });

    readonly isUploading = computed(() => {
        const task = this.task();
        return task ? ACTIVE_UPLOAD_STATES.has(task.state) : false;
    });

    readonly progress = computed(() => this.task()?.progress ?? 0);

    readonly error = computed(() => this.task()?.error ?? null);

    constructor() {
        this.restoreDrafts();

        this.draftSubject
            .pipe(takeUntilDestroyed(), debounceTime(400))
            .subscribe((metadata) => localStorage.setItem(DRAFT_METADATA_KEY, JSON.stringify(metadata)));

        effect(() => {
            const task = this.task();
            if (task?.state === 'completed') {
                this.taskId.set(null);
                this.clearDrafts();
                this.toast.success('Media subida correctamente.');
            } else if (task?.state === 'failed') {
                this.taskId.set(null);
                this.toast.error(task.error ?? 'Upload failed.');
            }
        });
    }

    selectFile(): void {
        this.fileInput()?.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        this.file.set(file);
        void this.fileStorage.saveDraftFile(file).catch(() => undefined);
        input.value = '';
    }

    openSearch(): void {
        this.searchOpen.set(true);
    }

    onMovieSelected(movie: MovieMetadata): void {
        this.metadata.set(movie);
        this.searchOpen.set(false);
    }

    onMetadataChange(metadata: MovieMetadata): void {
        this.draftSubject.next(metadata);
    }

    onSubmit(value: MediaFormValue): void {
        const file = this.file();
        if (!file) {
            this.toast.warning('Selecciona un archivo primero.');
            return;
        }
                this.taskId.set(this.uploadFacade.startUpload(file, value.metadata, value.kind));
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    private restoreDrafts(): void {
        const raw = localStorage.getItem(DRAFT_METADATA_KEY);
        if (raw) {
            try {
                this.metadata.set(JSON.parse(raw) as MovieMetadata);
            } catch {
                localStorage.removeItem(DRAFT_METADATA_KEY);
            }
        }

        void this.fileStorage.loadDraftFile().then((file) => {
            if (file) this.file.set(file);
        });
    }

    private clearDrafts(): void {
        localStorage.removeItem(DRAFT_METADATA_KEY);
        this.metadata.set(null);
        this.file.set(null);
        void this.fileStorage.clearDraftFile().catch(() => undefined);
    }
}
