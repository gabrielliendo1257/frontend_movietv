import { Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-featured-movie-card',
    imports: [],
    templateUrl: './featured-movie-card.html',
    styleUrl: './featured-movie-card.css',
})
export class FeaturedMovieCard {
    title = input.required<string>();
    backdropUrl = input<string>('');
    overview = input<string>('');
    meta = input<string>('');
}
