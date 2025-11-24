import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import MovieService from '@features/movies/services/movie-service';
import {Movie} from '@features/movies/models/movie-models';
import {CardMovie} from '@features/movies/components/card-movie/card-movie';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {InputSearch} from '@shared/components/input-search/input-search';
import {CircleLoader} from '@shared/components/loaders/circle-loader/circle-loader';
import {Pagination} from '@shared/models/response-api';

@Component({
    selector: 'app-movie-list',
    imports: [
        CardMovie,
        MatIconModule,
        FormsModule,
        InputSearch,
        CircleLoader,
    ],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.css',
})
export class MovieList implements OnInit {

    movieService: MovieService = inject(MovieService);
    movies: Movie[] | undefined;

    component = CardMovie
    query: string = ''

    @ViewChild('loader') loaderRef!: CircleLoader<{ data: Pagination<Movie>, error: boolean } | { data: null; error: boolean; }>

    ngOnInit(): void {
        console.log("INIT");
    }

    async searchMovies(textQuery: string) {
        this.query = textQuery;
        this.loaderRef.initLoader(textQuery, async () => {
            return this.movieService.searchMovie(textQuery);
        })
            .then(result => {
                if (result) {
                    this.movies = result.data?.results;
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
}
