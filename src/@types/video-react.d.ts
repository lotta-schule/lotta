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

    export interface BigPlayButtonProps {
        position: string;
    }

    export const BigPlayButton: ComponentType<BigPlayButtonProps>;

    export interface ShortcutProps {
        clickable?: boolean;
        dblclickable?: boolean;
        shortcuts?: any[];
    }

    export const Shortcut: ComponentType<Shortcut>;

    export interface PosterImageProps {
        poster: string;
    }

    export const PosterImage: ComponentType<PosterImageProps>;

    export interface LoadingSpinnerProps { }

    export const LoadingSpinner: ComponentType<LoadingSpinnerProps>;

    export interface ControlBarProps {
        autoHide?: boolean;
        autoHideTime?: boolean;
        disableDefaultControls?: boolean;
        disableCompletely?: boolean;
    }

    export const ControlBar: ComponentType<ControlBarProps>;


    export interface PlayToggleProps {
        poster: string;
    }

    export const PlayToggle: ComponentType<PlayToggleProps>;


    export interface ReplayControlProps {
        seconds: 5 | 10 | 30;
    }

    export const ReplayControl: ComponentType<ReplayControlProps>;

    export interface ForwardControlProps {
        seconds: 5 | 10 | 30;
    }

    export const ForwardControl: ComponentType<ForwardControlProps>;

    export interface VolumeMenuButtonProps {
        vertical?: boolean;
    }

    export const VolumeMenuButton: ComponentType<VolumeMenuButtonProps>;

    export interface PlaybackRateMenuButtonProps {
        rates?: number[];
    }

    export const PlaybackRateMenuButton: ComponentType<PlaybackRateMenuButtonProps>;

    export interface ClosedCaptionButtonProps { }

    export const ClosedCaptionButton: ComponentType<ClosedCaptionButtonProps>;
};
