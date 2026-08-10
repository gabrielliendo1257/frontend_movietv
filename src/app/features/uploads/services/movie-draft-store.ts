import { inject, Injectable, DestroyRef } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';

const DRAFT_STORAGE_KEY = 'movie-draft';

@Injectable({
    providedIn: 'root',
})
export class MovieDraftStore {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);

    readonly form = this.fb.group({
        id: this.fb.control<number>(0),
        title: this.fb.control<string>('', Validators.required),
        originalTitle: this.fb.control<string>(''),
        year: this.fb.control<number | null>(null),
        genres: this.fb.control<string[]>([]),
        popularity: this.fb.control<number>(5),
        duration: this.fb.control<string>(''),
        director: this.fb.control<string>(''),
        cast: this.fb.control<string[]>([]),
        overview: this.fb.control<string>(''),
        poster_path: this.fb.control<string | null>(null),
        release_date: this.fb.control<string>(''),
        country: this.fb.control<string>(''),
        language: this.fb.control<string>(''),
        awards: this.fb.control<string[]>([]),
    });

    readonly controls = this.form.controls;

    constructor() {
        this.restoreDraft();

        this.form.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(400))
            .subscribe(() => this.persistDraft());

        document.addEventListener('visibilitychange', this.flushDraft);
        window.addEventListener('pagehide', this.flushDraft);

        this.destroyRef.onDestroy(() => {
            document.removeEventListener('visibilitychange', this.flushDraft);
            window.removeEventListener('pagehide', this.flushDraft);
        });
    }

    patchFromMovie(movie: MovieMetadata): void {
        this.form.patchValue(movie);
    }

    reset(): void {
        this.form.reset({
            id: 0,
            title: '',
            originalTitle: '',
            year: null,
            genres: [],
            popularity: 5,
            duration: '',
            director: '',
            cast: [],
            overview: '',
            poster_path: null,
            release_date: '',
            country: '',
            language: '',
            awards: [],
        });

        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    private readonly flushDraft = (): void => {
        if (document.visibilityState === 'hidden') {
            this.persistDraft();
        }
    };

    private persistDraft(): void {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(this.form.getRawValue()));
    }

    private restoreDraft(): void {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return;

        try {
            this.form.patchValue(JSON.parse(raw));
        } catch {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
    }
}