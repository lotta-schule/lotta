import React, { FunctionComponent, memo } from 'react';

export interface PlaceholderImageProps {
    width: number | string;
    height: number | string;
    icon?: 'video' | 'image';
}

export const PlaceholderImage: FunctionComponent<PlaceholderImageProps> = memo(({ width, height, icon }) => {
    const iconSource = icon === 'video' ? '/img/SwitchVideo.svg' : '/img/Photo.svg';
    return (
        <div style={{ width, height, background: `#efefef url("${iconSource}") no-repeat scroll center center` }} />
    );
});