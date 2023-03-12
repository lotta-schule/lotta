import * as React from 'react';

export type ProcessingOptions = {
    width?: number;
    height?: number;
    aspectRatio?: '1:1' | '4:3' | '16:9' | '6:1';
    resize?: 'contain' | 'cover' | 'inside' | 'outside';
};

export const createImageUrl = (
    src: string,
    { resize, width, height, aspectRatio }: ProcessingOptions
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
    return url.toString();
};

export const useImageUrl = (
    imageUrl: string | null | undefined,
    { width, height, aspectRatio, resize = 'cover' }: ProcessingOptions = {}
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
            });
        },
        [aspectRatio, imageUrl, resize]
    );

    const sizeMap = React.useMemo(() => {
        if (!imageUrl) {
            return {};
        }
        if (width) {
            return Object.fromEntries(
                new Array(Math.floor((width * 1.5) / 200))
                    .fill(0)
                    .map((_, i) => {
                        const currentWidth = (i + 1) * 200 + (width % 200);
                        const currentHeight =
                            height && (i + 1) * 200 + (height % 200);
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
                new Array(Math.floor((height * 1.5) / 200))
                    .fill(0)
                    .map((_, i) => {
                        const currentHeight =
                            height && (i + 1) * 200 + (height % 200);
                        return [
                            `${currentHeight}h`,
                            getUrlForDimensions({ height: currentHeight }),
                        ];
                    })
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
