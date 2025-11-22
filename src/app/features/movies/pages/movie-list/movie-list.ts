import {Component, inject, OnInit, signal} from '@angular/core';
import MovieService from '@features/movies/services/movie-service';
import {Movie} from '@features/movies/models/movie-models';
import {CardMovie} from '@features/movies/components/card-movie/card-movie';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {InputSearch} from '@shared/components/input-search/input-search';
import {AuthService} from '@core/services/auth.service';

@Component({
    selector: 'app-movie-list',
    imports: [
        CardMovie,
        MatIconModule,
        FormsModule,
        InputSearch,
    ],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.css',
})
export class MovieList implements OnInit {

    movieService: MovieService = inject(MovieService);
    authService: AuthService = inject(AuthService)
    movies: Movie[] | undefined;
    state: 'idle' | 'loading' | 'success' | 'empty' = 'idle';

    component = CardMovie

    ngOnInit(): void {
        console.log("INIT");
        this.authService.isAdmin()
            .then((data) => {
                console.log("Is Admin: ", data)
            })
    }

    searchMovies(textQuery: string) {
        this.state = 'loading';
        this.movieService.searchMovie(textQuery)
            .then((data) => {
                this.state = 'success';
                this.movies = data.data?.results;
            })
            .catch(() => {
                this.state = 'empty'
                console.log("Bad request.");
            })
    }
}
