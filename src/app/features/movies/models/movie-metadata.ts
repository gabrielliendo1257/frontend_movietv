export interface MovieMetadata {
    id: number;
    title: string;
    originalTitle: string;
    year: number | null;
    genres: string[];
    popularity: number;
    duration: string;
    director: string;
    cast: string[];
    overview: string;
    poster_path: string | null;
    release_date: string;
    country: string;
    language: string;
    awards: string[];
}
