import React, { FunctionComponent, memo } from 'react';
import { Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/styles';

export interface PlaceholderImageProps {
    width: number | string;
    height: number | string;
    icon?: 'video' | 'image';
}

export const PlaceholderImage: FunctionComponent<PlaceholderImageProps> = memo(({ width, height, icon }) => {
    const theme: Theme = useTheme();
    const iconSource = icon === 'video' ? '/img/SwitchVideo.svg' : '/img/Photo.svg';
    return (
        <div style={{ width, height, background: `${theme.palette.grey[200]} url("${iconSource}") no-repeat scroll center center` }} />
    );
});