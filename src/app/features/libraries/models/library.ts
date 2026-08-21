import { MediaKind } from '@features/movies/models/media-kind';

export interface Library {
    id: number;
    type: string;
    enabled: boolean;
}

export type MediaAssetStatus = 'IDENTIFIED' | 'UNIDENTIFIED';

export interface MediaAsset {
    id: number;
    libraryId: number;
    relativePath: string;
    size: number;
    mimeType: string;
    status: MediaAssetStatus;
    movieId: number | null;
}

export interface MediaAssetPage {
    items: MediaAsset[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface IdentifyAssetRequest {
    title?: string;
    tmdbId?: number;
    kind?: MediaKind;
}
