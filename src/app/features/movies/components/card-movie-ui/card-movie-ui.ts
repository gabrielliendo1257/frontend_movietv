import {Component, computed, inject, input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-card-movie-ui',
  imports: [],
  templateUrl: './card-movie-ui.html',
  styleUrl: './card-movie-ui.css',
})
export class CardMovieUi {
    private readonly router = inject(Router);

    posterUrl = input<string>('');
    title = input.required<string>();
    subtitle = input<string>('');
    rating = input<number | null>(null);
    year = input<string | null | undefined>(null);
    duration = input<string | null>(null);
    genre = input<string | null>(null);
    link = input<string>('');

    readonly ratingLabel = computed(() =>
        this.rating() == null ? null : this.rating()!.toFixed(1),
    );

    onCardClick(): void {
        if (this.link()) {
            this.router.navigateByUrl(this.link());
        }
    }
}
