import { Component, inject, OnInit } from '@angular/core';
import { MovieApiService } from '@features/movies/services/movie-api.service';
import { RequestMedia } from '@features/movies/models/movie-models';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';

@Component({
    selector: 'app-personal-movies',
    imports: [CardMovieUi],
    templateUrl: './personal-movies.html',
    styleUrl: './personal-movies.css',
})
export class PersonalMovies implements OnInit {
    private readonly movieApiService = inject(MovieApiService);

    movies: RequestMedia[] | null = null;

    ngOnInit(): void {
        this.listMedias();
    }

    private listMedias(): void {
        this.movieApiService.listAll().subscribe({
            next: (movies) => {
                this.movies = movies;
            },
            error: (error) => console.error(error),
        });
    }

    selectMovie(currentMovie: RequestMedia): void {
        const firstFile = currentMovie.s3_data[0];
        if (!firstFile) return;

        this.movieApiService.streamingSession(firstFile.object_key).subscribe({
            next: (session) => {
                if (session.presigned_url) {
                    window.location.href = session.presigned_url;
                }
            },
            error: (error) => console.error(error),
        });
    }
}