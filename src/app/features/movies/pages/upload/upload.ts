import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {InputFile} from '@shared/components/input-file/input-file';
import {InputSearch} from '@shared/components/input-search/input-search';
import MovieService from '@features/movies/services/movie-service';
import {MiniCardMovie} from '@shared/components/mini-card-movie/mini-card-movie';
import {Movie} from '@features/movies/models/movie-models';
import {NgClass} from '@angular/common';
import {FileUploadComponent, UploadState} from '@shared/components/file-upload-component/file-upload-component';
import {MatIconModule} from '@angular/material/icon';

@Component({
    selector: 'app-upload',
    imports: [
        FormsModule,
        InputFile,
        InputSearch,
        MiniCardMovie,
        NgClass,
        FileUploadComponent,
        MatIconModule,
    ],
    templateUrl: './upload.html',
    styleUrl: './upload.css',
})
export class Upload {
    movieService = inject(MovieService)
    state: 'idle' | 'loading' | 'success' | 'empty' = 'idle';
    uploadingState!: UploadState;
    movies: Movie[] | undefined;
    movieSelected: Movie | undefined;
    isUploading = false
    isHidden = true
    file: File | null = null;

    @ViewChild('upload') uploadRef!: InputFile

    upload() {
        // placeholder: in a real app you'd open a file picker or trigger a service
        alert('Abrir selector de archivos (implementa según tu app)');
    }

    searchMovies(textQuery: string) {
        this.state = 'loading';
        this.movieService.searchMovie(textQuery)
            .then((data) => {
                if (data.error) {
                    console.log("Error, empty data.");
                    this.state = 'empty'
                } else {
                    this.state = 'success'
                    this.movies = data.data?.results
                }
            })
            .catch(() => {
                console.log("Bad request.");
                this.state = 'empty';
            })
    }

    currentMovie(movie: Movie) {
        this.isHidden = !this.isHidden
        this.movieSelected = movie
    }

    cancelButton() {
        this.isHidden = !this.isHidden
        this.state = 'idle'
    }

    currentFile(file: File) {
        this.file = file
    }

    uploadMedia() {
        this.isUploading = !this.isUploading
        console.log("Uploading file: ", this.file)
        this.uploadingState = 'uploading'
        this.movieService.uploadSession(this.file!.name)
            .then((dataSession) => {
                if (dataSession.error) {
                    console.log("Error response uploader s3.")
                } else {
                    console.log("S3 uploader: ", dataSession);
                    this.movieService.uploadMedia(this.file!, dataSession.data!.presigned_url)
                        .then((dataUpload) => {
                            if (dataUpload.error) {
                                console.log("Error en respuesta s3.");
                                this.uploadingState = 'error'
                            } else {
                                this.uploadingState = 'complete'
                                console.log("Object Key: ", dataSession.data!.object_key);
                                this.movieService.saveMovie(this.movieSelected!, dataSession.data!.object_key)
                                    .then((data) => {
                                        if (data.error) {
                                            console.log("Error al persistir movie.")
                                        } else {
                                            console.log("Movie result: ", data.data);
                                        }
                                    })
                            }
                        })
                        .catch(() => {
                            console.log("Error al percistir media.");
                        })
                }
            })
            .catch(() => {
                console.log("Invalid request.");
            })
    }

    uploadMore() {
        this.isUploading = !this.isUploading
        this.isHidden = !this.isHidden
        this.movieSelected = undefined
        this.clearInput()
    }

    clearInput() {
        this.file = null;     // limpio mi variable
        this.uploadRef.clear();    // limpio el input dentro del hijo
    }
}
