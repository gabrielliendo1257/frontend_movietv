import {Component, inject, OnInit, signal} from '@angular/core';
import MovieService from '@features/movies/services/movie-service';
import {Movie} from '@features/movies/models/movie-models';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {InputSearch} from '@shared/components/input-search/input-search';
import {CardMovieUi} from '@features/movies/components/card-movie-ui/card-movie-ui';
import {CardMovieSkeleton} from '@features/movies/components/card-movie-skeleton/card-movie-skeleton';
import {MovieMetadata} from '@features/uploads/components/upload-panel/movie-data';
import {catchError, EMPTY, map, tap} from 'rxjs';

export type StatusSearch = 'IDLE' | 'SEARCHING' | 'EMPTY_LIST' | 'ERROR_SEARCH' | 'SUCCESS_SEARCH';

@Component({
    selector: 'app-movie-list',
    imports: [
        MatIconModule,
        FormsModule,
        InputSearch,
        CardMovieUi,
        CardMovieSkeleton,
    ],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.css',
})
export class MovieList implements OnInit {
    movieService: MovieService = inject(MovieService);

    movies = signal<MovieMetadata[] | null>(null);
    query = signal<string | null>(null);
    _statusSearch = signal<StatusSearch>('IDLE');

    ngOnInit(): void {
        console.log("INIT");
    }

    async searchMovies(textQuery: string) {
        this.query.set(textQuery);
        this._statusSearch.set('SEARCHING');
        this.movieService.searchMovie(textQuery)
            .pipe(
                tap(pag => {
                    return pag.results.map(movieMetadata => {
                        'https://image.tmdb.org/t/p/w500'+movieMetadata.poster_path
                        })
                }),

                map(pag => {
                    if (pag.results.length == 0) {
                        this._statusSearch.set('EMPTY_LIST');
                    } else {
                        this._statusSearch.set('SUCCESS_SEARCH');
                        this.movies.set(pag.results);
                    }
                }),

                catchError(error => {
                    console.error(error);
                    //this.handleError('Upload failed.');

                    return EMPTY;
                })
            )
            .catch(error => {
                this._statusSearch.set('ERROR_SEARCH');
                console.log(error);
            })
    }
}
