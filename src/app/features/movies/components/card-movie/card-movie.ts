import {Component, input} from '@angular/core';
import {Movie, RequestMedia} from '@features/movies/models/movie-models';
import {MatIconModule} from '@angular/material/icon';

@Component({
    selector: 'app-card-movie',
    imports: [
        MatIconModule
    ],
    templateUrl: './card-movie.html',
    styleUrl: './card-movie.css',
})
export class CardMovie {
    moviesCatalog = input<Movie | RequestMedia>();
    basePosterUrl = 'https://image.tmdb.org/t/p/w500'

    getPosterUrl(pathPoster: string | undefined): string {
        return pathPoster !== undefined ? this.basePosterUrl + pathPoster: '';
    }
}
