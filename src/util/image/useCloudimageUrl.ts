import * as React from 'react';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export type CloudImageOptions = {
    width?: number;
    height?: number;
    aspectRatio?: '1:1' | '4:3' | '16:9' | '6:1';
    resize?: 'crop' | 'fit' | 'bound' | 'cover';
};

export const createCloudimageUrl = (
    src: string,
    { resize, width, height, aspectRatio }: CloudImageOptions
) => {
    if (!src) {
        return '';
    }

    if (cloudimageToken) {
        const srcWithoutProtocol = src.replace(/^https?:\/\//, '');
        const url = new URL(
            `https://${cloudimageToken}.cloudimg.io/v7/${srcWithoutProtocol}`
        );
        url.searchParams.set('sharp', String(1));
        if (width) {
            url.searchParams.set('width', String(width));
        }
        if (height) {
            url.searchParams.set('height', String(height));
        }
        if (resize) {
            url.searchParams.set('func', resize);
            url.searchParams.set('gravity', 'auto');
            if (['fit', 'bound'].includes(resize) && width && aspectRatio) {
                const [wr, hr] = aspectRatio.split(':').map(Number);
                const ratio = wr / hr;
                if (wr > hr) {
                    url.searchParams.set(
                        'height',
                        String(Math.floor(width / ratio))
                    );
                } else {
                    url.searchParams.set('width', String(width * ratio));
                }
            }
        }
        if (aspectRatio) {
            url.searchParams.set('aspect_ratio', aspectRatio);
        }
        return url.toString();
    } else {
        return src;
    }
};

export const useCloudimageUrl = (
    imageUrl: string | null | undefined,
    { width, height, aspectRatio, resize = 'cover' }: CloudImageOptions = {}
) => {
    const getUrlForDimensions = React.useCallback(
        (dimensions: { width?: number; height?: number }) => {
            if (!imageUrl) {
                return null;
            }

            return createCloudimageUrl(imageUrl, {
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
