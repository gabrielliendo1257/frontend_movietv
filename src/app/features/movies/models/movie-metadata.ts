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
    /** Puede faltar en películas sin enriquecer (el backend no siempre lo envía). */
    release_date?: string | null;
    country: string;
    language: string;
    awards: string[];
}
