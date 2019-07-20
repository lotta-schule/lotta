import React, { FunctionComponent, memo } from 'react';

export interface PlaceholderImageProps {
    width: number | string;
    height: number | string;
}

export const PlaceholderImage: FunctionComponent<PlaceholderImageProps> = memo(({ width, height }) => (
    <div style={{ width, height, background: '#efefef url("/img/Photo.svg") no-repeat scroll center center' }} />
));