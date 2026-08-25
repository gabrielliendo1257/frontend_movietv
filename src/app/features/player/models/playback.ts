/** Estrategia de entrega; hoy DIRECT (Range sobre URL auto-autenticada). */
export type PlaybackStrategy = 'DIRECT';

/** Datos mínimos de la media para pintar el player. */
export interface PlaybackMediaInfo {
    readonly id: number;
    readonly title: string;
    readonly posterPath: string | null;
    readonly duration: string | null;
}

/** Acceso directo al contenido: presigned (MANAGED) o proxy del BFF (LOCAL). */
export interface PlaybackSource {
    readonly strategy: PlaybackStrategy;
    readonly url: string;
    readonly mimeType: string | null;
    /** Caducidad de la URL/capability; el front puede renovar la sesión al expirar. */
    readonly expiresAt: Date | null;
}

/** Respuesta de "quiero reproducir este contenido ahora". */
export interface PlaybackSession {
    readonly sessionId: string;
    readonly media: PlaybackMediaInfo;
    readonly source: PlaybackSource;
    /** Posición de reanudación en segundos; null hasta que exista watch history. */
    readonly resumeSeconds: number | null;
}
