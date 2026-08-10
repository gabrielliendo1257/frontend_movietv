export interface Movie {
    readonly id: number;
    readonly overview: string;
    readonly poster_path: string;
    readonly release_date: string;
    readonly title: string;
    readonly vote_average: number;
    readonly popularity: number;
}

export interface S3Data {
    object_key: string;
    presigned_url: string;
}

export interface SignatureData extends S3Data {
    presigned_url: string;
}

export interface RequestMedia extends Movie {
    s3_data: S3Data[];
}
