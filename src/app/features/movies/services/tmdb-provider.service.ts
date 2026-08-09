import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {ResponsePresignedUrl} from '@core/models/s3';
import {Movie, RequestMedia, SignatureData} from '@features/movies/models/movie-models';
import {Pagination} from '@shared/models/response-api';
import {environment} from '../../../../environments/environment';
import {MovieMetadata} from '@features/uploads/components/upload-panel/movie-data';

@Injectable({
    providedIn: 'root',
})
class MovieService {

    private readonly externalApiToken: String = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MzBjNDA4ZjQ0MmY2N2MwM2I4ODliNThmNGEwYzUzMCIsIm5iZiI6MTc2Mjk4OTgwMi4zNTEsInN1YiI6IjY5MTUxNmVhYTMzNDQ5YzA2NjljNGRlMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qLE518W4bDDVaMRYMp93S-Al9Yu1Pe48DT0ABf8Xsug'

    constructor(private httpClient: HttpClient) {
    }

    // Todo External api
    searchMovie(query: string) {
        return this.httpClient.get<Pagination<MovieMetadata>>('https://api.themoviedb.org/3/search/movie', {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + this.externalApiToken,
                'Accept': 'application/json'
            },
            params: {
                'include_adult': false,
                'language': 'es-ES',
                'page': 1,
                'query': query
            }
        })
    }

    findMovieDetails(movieId: number) {
        return this.httpClient.get<Pagination<MovieMetadata>>(`https://api.themoviedb.org/3/movie/${movieId}`, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + this.externalApiToken,
                'accept': 'application/json'
            }
        })
    }

    // Todo Servidor: backend propio
    async uploadSession(file: String) {
        try {
            const data = await lastValueFrom(
                this.httpClient.post<ResponsePresignedUrl>(environment.backendAddress + '/api/v1/movie/upload-session', {
                    'filename': file
                }, {
                    withCredentials: true,
                    responseType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                })
            )

            return {
                data: data,
                error: false
            }
        } catch {
            return {
                data: null,
                error: true
            }
        }
    }

    async saveMovie(movie: Movie, objectKey: string) {
        try {
            const data = await lastValueFrom(
                this.httpClient.post(environment.backendAddress + '/api/v1/movie/save',
                    {
                        'file': {
                            'filename': objectKey,
                        },
                        'media': {...movie}
                    }, {
                        withCredentials: true,
                        responseType: 'json',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    })
            )

            return {
                data: data,
                error: false
            }
        } catch {
            return {
                data: null,
                error: true
            }
        }
    }

    async uploadMedia(file: File, presignedUrl: string) {
        try {
            const res = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,               // streaming binario real
                headers: {
                    'Content-Type': file.type
                },
            });

            return {
                data: res,
                error: false
            }
        } catch {
            return {
                data: null,
                error: true
            }
        }
    }

    async getAllMedia() {
        try {
            const data = await lastValueFrom(
                this.httpClient.get<RequestMedia[]>(environment.backendAddress + '/api/v1/movie/all', {
                    withCredentials: true,
                    responseType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                })
            )

            return {
                data: data,
                error: false
            }
        } catch {
            return {
                data: null,
                error: true
            }
        }
    }

    async sessionStreaming(objectKey: string) {
        try {
            const data = await lastValueFrom(
                this.httpClient.post<SignatureData>(environment.backendAddress + '/api/v1/movie/streaming-session', {
                    filename: objectKey
                }, {
                    withCredentials: true,
                    responseType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                })
            )

            return {
                data: data,
                error: false
            }
        } catch {
            return {
                data: null,
                error: true
            }
        }
    }
}

export default MovieService
