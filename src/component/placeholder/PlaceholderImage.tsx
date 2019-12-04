import React, { FunctionComponent, memo } from 'react';
import { Theme, makeStyles, Typography } from '@material-ui/core';

export interface PlaceholderImageProps {
    width: number | string;
    height: number | string;
    icon?: 'video' | 'image';
    description?: string;
}

const useStyles = makeStyles<Theme, { iconSource: string, description?: string }>(theme => ({
    root: {
        backgroundImage: ({ iconSource }) => `url("${iconSource}")`,
        backgroundColor: theme.palette.grey[200],
        backgroundRepeat: 'no-repeat',
        backgroundSize: ({ description }) => description ? '35%' : 'contain',
        backgroundPosition: ({ description }) => description ? 'top center' : 'center center',
        display: 'flex',
        alignItems: ({ description }) => description ? 'flex-end' : 'center',
        textAlign: 'center',
    }
}));

export const PlaceholderImage: FunctionComponent<PlaceholderImageProps> = memo(({ width, height, icon, description }) => {
    const iconSource = icon === 'video' ? '/img/SwitchVideo.svg' : '/img/Photo.svg';
    const styles = useStyles({ iconSource, description });
    return (
        <div
            style={{ width, height }}
            className={styles.root}
        >
            <Typography variant={'h5'} style={{ marginBottom: '1em' }}>
                {description}
            </Typography>
        </div >
    );
});