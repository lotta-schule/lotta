declare module 'video-react' {

    import { ComponentType } from 'react';

    export interface PlayerProps {
        fluid?: boolean;
        width?: number;
        height?: number;
        src?: string;
        poster?: string;
        preload?: 'none' | 'metadata' | 'auto';
        muted?: boolean;
        playsInline?: boolean;
        aspectRatio?: 'auto' | '16:9' | ' 4:3' | string;
        autoPlay?: boolean;
        startTime?: number;
    }

    export const Player: ComponentType<PlayerProps> & {
        playbackRate: number;
        muted: boolean;
        volume: number;
        videoWidth: number;
        videoHeight: number;
        video: any; // TODO: add video type
        getState(): any;
        play(): void;
        pause(): void;
        load(): void;
        addTextTrack(): void;
        canPlayType(): void;
        seek(time: number): void;
        forward(seconds: number): void;
        replay(seconds: number): void;
        toggleFullscreen(): void;
        subscribeToStateChange(listener: EventListener): void;
    };
};
