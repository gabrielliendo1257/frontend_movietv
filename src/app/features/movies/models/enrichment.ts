export interface EnrichmentSearchResult {
    tmdb_id: number;
    title: string;
    year: number | null;
    poster_path: string | null;
    release_date: string;
    overview: string;
}

export interface EnrichmentPreview {
    tmdb_id: number;
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
}