import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {ResponsePresignedUrl} from '@core/models/s3';
import {Movie, RequestMedia, SignatureData} from '@features/movies/models/movie-models';
import {Pagination} from '@shared/models/response-api';

@Injectable({
    providedIn: 'root',
})
class MovieService {

    readonly externalApiToken: String = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MzBjNDA4ZjQ0MmY2N2MwM2I4ODliNThmNGEwYzUzMCIsIm5iZiI6MTc2Mjk4OTgwMi4zNTEsInN1YiI6IjY5MTUxNmVhYTMzNDQ5YzA2NjljNGRlMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qLE518W4bDDVaMRYMp93S-Al9Yu1Pe48DT0ABf8Xsug'

    constructor(private httpClient: HttpClient) {
    }

    // Todo External api
    async searchMovie(query: string) {
        try {
            const data = await lastValueFrom(
                this.httpClient.get<Pagination<Movie>>('https://api.themoviedb.org/3/search/movie', {
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

    // Todo Servidor: backend propio
    async uploadSession(file: String) {
        try {
            const data = await lastValueFrom(
                this.httpClient.post<ResponsePresignedUrl>('http://192.168.1.103:8080/api/v1/movie/upload-session', {
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
                this.httpClient.post('http://192.168.1.103:8080/api/v1/movie/save',
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
                this.httpClient.get<RequestMedia[]>('http://192.168.1.103:8080/api/v1/movie/all', {
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
                this.httpClient.post<SignatureData>('http://192.168.1.103:8080/api/v1/movie/streaming-session', {
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
