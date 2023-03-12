import * as React from 'react';
import { ProcessingOptions, useImageUrl } from './useImageUrl';

export type ResponsiveImageProps = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
} & Omit<
    React.DetailedHTMLProps<
        React.ImgHTMLAttributes<HTMLImageElement>,
        HTMLImageElement
    >,
    'src' | 'alt' | 'width'
> &
    Omit<ProcessingOptions, 'width' | 'height'>;

export const ResponsiveImage = React.memo<ResponsiveImageProps>(
    ({
        src,
        alt,
        style,
        className,
        width,
        height,
        aspectRatio,
        resize,
        sizes,
        ...imgProps
    }) => {
        const { customStyle, sizeMap, url } = useImageUrl(src, {
            width,
            height,
            aspectRatio,
            resize,
        });

        return (
            <img
                className={className}
                src={url ?? ''}
                srcSet={Object.entries(sizeMap)
                    .map(([size, src]) => `${src} ${size}`)
                    .join(', ')}
                alt={alt}
                style={{ ...customStyle, ...style }}
                sizes={sizes ?? '100%'}
                {...imgProps}
            />
        );
    }
);
ResponsiveImage.displayName = 'ResponsiveImage';
