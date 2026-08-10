import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-featured-movie-card',
    imports: [],
    templateUrl: './featured-movie-card.html',
    styleUrl: './featured-movie-card.css',
})
export class FeaturedMovieCard {
    private readonly router = inject(Router);

    title = input.required<string>();
    backdropUrl = input<string>('');
    overview = input<string>('');
    meta = input<string>('');
    link = input<string>('');

    onCardClick(): void {
        if (this.link()) {
            this.router.navigateByUrl(this.link());
        }
    }
}
