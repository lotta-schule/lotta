import * as React from 'react';

export type ProcessingOptions = {
    width?: number;
    height?: number;
    aspectRatio?: '1:1' | '4:3' | '3:2' | '16:9' | '6:1';
    resize?: 'contain' | 'cover' | 'inside' | 'outside';
    format?: 'jpg' | 'png' | 'webp' | 'tiff';
};

export const createImageUrl = (
    src: string,
    { resize, width, height, aspectRatio, format }: ProcessingOptions
) => {
    if (!src) {
        return src;
    }

    const url = new URL(src);
    if (width) {
        url.searchParams.set('width', String(width));
        if (aspectRatio) {
            const [wr, hr] = aspectRatio.split(':').map(Number);
            const ratio = wr / hr;
            if (wr > hr) {
                url.searchParams.set(
                    'height',
                    String(Math.floor(width / ratio))
                );
            } else {
                url.searchParams.set('height', String(width * ratio));
            }
        }
    }
    if (height) {
        url.searchParams.set('height', String(height));
    }
    if (resize) {
        url.searchParams.set('fn', resize);
    }
    if (format) {
        url.searchParams.set('format', format);
    }
    return url.toString();
};

export const useImageUrl = (
    imageUrl: string | null | undefined,
    {
        width,
        height,
        aspectRatio,
        resize = 'cover',
        format,
    }: ProcessingOptions = {},
    { maxDisplayWidth = 1920 }: { maxDisplayWidth?: number } = {}
) => {
    const getUrlForDimensions = React.useCallback(
        (dimensions: { width?: number; height?: number }) => {
            if (!imageUrl) {
                return null;
            }

            return createImageUrl(imageUrl, {
                width: dimensions.width,
                height: dimensions.height,
                aspectRatio,
                resize,
                format,
            });
        },
        [aspectRatio, imageUrl, resize, format]
    );

    const sizeMap = React.useMemo(() => {
        if (!imageUrl) {
            return {};
        }
        if (width) {
            const supportedSlices = new Set(
                [0.5, 1, 2, 3].map((m) => {
                    const w = m * width;
                    return w > maxDisplayWidth * 2 ? maxDisplayWidth * 2 : w;
                })
            );
            return Object.fromEntries(
                [...supportedSlices].map((currentWidth) => {
                    const currentHeight =
                        height && currentWidth * (height / width);
                    return [
                        `${currentWidth}w`,
                        getUrlForDimensions({
                            width: currentWidth,
                            height: currentHeight,
                        }),
                    ];
                })
            );
        } else if (height) {
            return Object.fromEntries(
                new Array(3)
                    .fill(0)
                    .map((_, i) => [
                        `${i + 1}x`,
                        getUrlForDimensions({ height: height * (i + 1) }),
                    ])
            );
        } else {
            return {};
        }
    }, [imageUrl, width, height, getUrlForDimensions]);

    const customStyle = React.useMemo(() => {
        const style: React.CSSProperties = {};
        if (aspectRatio && !['fit', 'bound'].includes(resize)) {
            const [width, height] = aspectRatio.split(':');
            style.aspectRatio = String(Number(width) / Number(height));
        }
        return style;
    }, [aspectRatio, resize]);

    if (!imageUrl) {
        return {
            url: null,
            sizeMap,
            customStyle,
        };
    }

    return {
        url: getUrlForDimensions({ width, height }),
        sizeMap,
        customStyle,
    };
};
