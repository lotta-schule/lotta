declare module 'react-cloudimage-responsive' {

    import { ComponentType, ImgHTMLAttributes } from 'react';

    export interface CloudimageProviderConfig {
        token?: string;
        baseUrl?: string;
        lazyLoading?: boolean;
        imgLoadingAnimation?: boolean;
        filters?: string;
        placeholderBackground?: string;
        presets?: object;
    }

    export interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
        src?: string;
        alt?: string;
        className?: string;
        operation?: 'width' | 'height' | 'crop' | 'fit' | 'cover';
        params?: string;
        size?: string;
        filters?: string;
        ratio?: number;
        lazyLoading?: boolean;
    }

    export const CloudimageProvider: ComponentType<{ config: CloudimageProviderConfig }>;

    const Img: ComponentType<ImgProps>;

    export const BackgroundImg: ComponentType<ImgProps>;

    export default Img;
};
