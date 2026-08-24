import { Injectable } from '@angular/core';

const MOVIE_STREAM_MAP_KEY = 'movie-stream-map';

@Injectable({
    providedIn: 'root',
})
export class MovieStreamStore {
    setMovie(movieId: number, storageId: string): void {
        try {
            const map = this.load();
            map[String(movieId)] = storageId;
            localStorage.setItem(MOVIE_STREAM_MAP_KEY, JSON.stringify(map));
        } catch {
            // storage no disponible (privacy mode, etc.): el streaming cae al fallback
        }
    }

    getStorageId(movieId: number): string | null {
        try {
            return this.load()[String(movieId)] ?? null;
        } catch {
            return null;
        }
    }

    private load(): Record<string, string> {
        const raw = localStorage.getItem(MOVIE_STREAM_MAP_KEY);
        if (!raw) return {};

        try {
            return JSON.parse(raw) as Record<string, string>;
        } catch {
            localStorage.removeItem(MOVIE_STREAM_MAP_KEY);
            return {};
        }
    }
}