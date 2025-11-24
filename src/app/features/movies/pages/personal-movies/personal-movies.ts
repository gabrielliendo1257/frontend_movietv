import {Component, inject, OnInit, ViewChild} from '@angular/core';
import MovieService from '@features/movies/services/movie-service';
import {CardMovie} from '@features/movies/components/card-movie/card-movie';
import {RequestMedia} from '@features/movies/models/movie-models';

@Component({
    selector: 'app-personal-movies',
    imports: [CardMovie],
    templateUrl: './personal-movies.html',
    styleUrl: './personal-movies.css',
})
export class PersonalMovies implements OnInit {

    movieService = inject(MovieService);
    movies!: RequestMedia[] | null;
    selectedMovie!: RequestMedia;

    ngOnInit(): void {
        this.getMedias();
    }

    getMedias() {
        this.movieService.getAllMedia()
            .then((data) => {
                if (data.error) {
                    console.log("Data error.")
                } else {
                    this.movies = data.data
                }
            })
            .catch(() => {
                console.log("Error.")
            })
    }

    selectMovie(currentMovie: RequestMedia) {
        this.selectedMovie = currentMovie;
        this.movieService.sessionStreaming(this.selectedMovie.s3_data[0].object_key)
            .then((data) => {
                if (data.error) {
                    console.log("Error")
                } else {
                    window.location.href = data.data?.presigned_url!
                }
            })
    }
}
