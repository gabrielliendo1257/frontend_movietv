/**
 * Contrato de la experiencia Catalog (GET /web/catalog).
 * El BFF deriva displayStatus/source y las capabilities; el front solo
 * decide cómo presentarlas — no reinterpreta estados.
 */

export type CatalogItemType = 'MEDIA' | 'ASSET';

export interface CatalogItemKey {
    type: CatalogItemType;
    id: number;
}

export interface CatalogItemCapabilities {
    play: boolean;
    viewDetail: boolean;
    editMetadata: boolean;
    changeVisibility: boolean;
    manageSharing: boolean;
    linkProvider: boolean;
    unlinkProvider: boolean;
    identify: boolean;
    delete: boolean;
}

export interface CatalogItem {
    key: CatalogItemKey;
    mediaId: number | null;
    assetId: number | null;
    assetPresent: boolean | null;
    title: string;
    posterUrl: string | null;
    year: number | null;
    duration: string | null;
    kind: string;
    status: string;
    displayStatus: string;
    source: string | null;
    visibility: string;
    sharedWithCount: number;
    providerStatus: string | null;
    capabilities: CatalogItemCapabilities;
}

export interface CatalogSummary {
    total: number;
    ready: number;
    needsAttention: number;
}

export interface CatalogPage {
    summary: CatalogSummary;
    items: CatalogItem[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

/** Trabajo encolado por una acción de catálogo (202). */
export type CatalogJobStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface CatalogJob {
    jobId: string;
    status: CatalogJobStatus;
    total: number;
    done: number;
    failed: number;
}

export interface CatalogChangeVisibilityRequest {
    movieIds?: number[];
    libraryIds?: number[];
    visibility: string;
    sharedWith?: string[];
}

export type CatalogStatusFilter =
    | 'ALL'
    | 'READY'
    | 'PROCESSING'
    | 'MISSING'
    | 'ATTENTION'
    | 'UNIDENTIFIED';

export type CatalogSortKey = 'updated' | 'title' | 'year';

export interface CatalogQueryParams {
    page: number;
    size: number;
    q?: string;
    status?: string;
    sort?: CatalogSortKey;
    dir?: 'asc' | 'desc';
}
