declare module 'fetch-progress' {

    export interface Progress {
        total: number;
        transferred: number;
        speed: number;
        eta: number;
        percentage: number;
        remaining: number;
    }

    export interface FetchProgressOptions {
        defaultSize?: number;
        emitDelay?: number;
        onProgress?(progress: Progress): void;
        onComplete?(): void;
        onError?(error: Error): void;
    }

    export default function fetchProgress(options: FetchProgressOptions): (response: Response) => Promise<Response>;
}