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
            error: () => {
                this.movies = this.mockMovies;
            },
        });
    }

    private readonly mockMovies: RequestMedia[] = [
        { id: 1, title: 'Inception', overview: '', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', release_date: '2010-07-16', vote_average: 8.4, popularity: 85, s3_data: [] },
        { id: 2, title: 'The Dark Knight', overview: '', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', release_date: '2008-07-18', vote_average: 9.0, popularity: 92, s3_data: [] },
        { id: 3, title: 'Interstellar', overview: '', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', release_date: '2014-11-07', vote_average: 8.7, popularity: 88, s3_data: [] },
        { id: 4, title: 'Pulp Fiction', overview: '', poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', release_date: '1994-10-14', vote_average: 8.5, popularity: 80, s3_data: [] },
        { id: 5, title: 'The Matrix', overview: '', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', release_date: '1999-03-31', vote_average: 8.2, popularity: 78, s3_data: [] },
        { id: 6, title: 'Gladiator', overview: '', poster_path: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', release_date: '2000-05-05', vote_average: 8.2, popularity: 75, s3_data: [] },
        { id: 7, title: 'Parasite', overview: '', poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', release_date: '2019-05-30', vote_average: 8.5, popularity: 90, s3_data: [] },
        { id: 8, title: 'Spirited Away', overview: '', poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', release_date: '2001-07-20', vote_average: 8.6, popularity: 82, s3_data: [] },
        { id: 9, title: 'The Shawshank Redemption', overview: '', poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', release_date: '1994-09-23', vote_average: 8.7, popularity: 95, s3_data: [] },
        { id: 10, title: 'Blade Runner 2049', overview: '', poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', release_date: '2017-10-06', vote_average: 8.0, popularity: 74, s3_data: [] },
        { id: 11, title: 'Dune', overview: '', poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', release_date: '2021-10-22', vote_average: 8.0, popularity: 87, s3_data: [] },
        { id: 12, title: 'The Godfather', overview: '', poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', release_date: '1972-03-24', vote_average: 8.7, popularity: 84, s3_data: [] },
        { id: 13, title: 'Oppenheimer', overview: '', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', release_date: '2023-07-21', vote_average: 8.1, popularity: 89, s3_data: [] },
        { id: 14, title: 'Joker', overview: '', poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', release_date: '2019-10-04', vote_average: 8.2, popularity: 86, s3_data: [] },
        { id: 15, title: 'Spider-Man: Into the Spider-Verse', overview: '', poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', release_date: '2018-12-14', vote_average: 8.4, popularity: 83, s3_data: [] },
        { id: 16, title: 'The Grand Budapest Hotel', overview: '', poster_path: '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', release_date: '2014-03-28', vote_average: 8.1, popularity: 77, s3_data: [] },
    ];

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