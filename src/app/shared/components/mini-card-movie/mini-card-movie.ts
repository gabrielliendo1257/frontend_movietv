import {Component, EventEmitter, input, Output} from '@angular/core';
import {Movie} from '@features/movies/models/movie-models';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-mini-card-movie',
  imports: [
      FormsModule
  ],
  templateUrl: './mini-card-movie.html',
  styleUrl: './mini-card-movie.css',
})
export class MiniCardMovie {

    moviesCatalog = input<Movie>();
    basePosterUrl = 'https://image.tmdb.org/t/p/w500'

    getPosterUrl(pathPoster: string | undefined): string {
        return pathPoster !== undefined ? this.basePosterUrl + pathPoster: '';
    }
}
