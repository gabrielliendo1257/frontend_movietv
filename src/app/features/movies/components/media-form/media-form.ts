import { Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { MediaKind } from '@features/movies/models/media-kind';
import { ChipsInput } from '@features/uploads/components/chips-input/chips-input';

export interface MediaFormValue {
    kind: MediaKind;
    metadata: MovieMetadata;
}

@Component({
    selector: 'app-media-form',
    imports: [ReactiveFormsModule, ChipsInput],
    templateUrl: './media-form.html',
    styleUrl: './media-form.css',
})
export class MediaForm {
    private readonly fb = inject(NonNullableFormBuilder);

    readonly initial = input<MovieMetadata | null>(null);
    readonly submitLabel = input('Guardar');

    readonly submitted = output<MediaFormValue>();

    readonly kind = signal<MediaKind>('MOVIE');

    readonly form = this.fb.group({
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

    readonly ratingStars = Array.from({ length: 10 }, (_, i) => i + 1);

    ngOnInit(): void {
        const initial = this.initial();
        if (initial) {
            this.form.patchValue(initial);
        }
    }

    setKind(value: MediaKind): void {
        this.kind.set(value);
    }

    setRating(value: number): void {
        this.controls.popularity.setValue(value);
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.submitted.emit({
            kind: this.kind(),
            metadata: this.form.getRawValue() as MovieMetadata,
        });
    }
}
