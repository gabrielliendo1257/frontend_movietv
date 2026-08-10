import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-card-movie-ui',
  imports: [],
  templateUrl: './card-movie-ui.html',
  styleUrl: './card-movie-ui.css',
})
export class CardMovieUi {
    posterUrl = input<string>('');
    title = input.required<string>();
    subtitle = input<string>('');
    rating = input<number | null>(null);
    year = input<string | null | undefined>(null);
    duration = input<string | null>(null);
    genre = input<string | null>(null);

    readonly ratingLabel = computed(() =>
        this.rating() == null ? null : this.rating()!.toFixed(1),
    );
}
