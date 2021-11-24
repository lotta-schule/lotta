import * as React from 'react';
import clsx from 'clsx';

import styles from './PlaceholderImage.module.scss';

export interface PlaceholderImageProps {
    width: number | string;
    height: number | string;
    icon?: 'video' | 'image';
    description?: string | React.ReactElement;
}

export const PlaceholderImage = React.memo<PlaceholderImageProps>(
    ({ width, height, icon, description }) => {
        const iconSource =
            icon === 'video' ? '/img/SwitchVideo.svg' : '/img/Photo.svg';
        return (
            <div
                style={{ width, height, backgroundImage: `url(${iconSource})` }}
                className={clsx(styles.root, {
                    [styles.withDescription]: !!description,
                })}
            >
                <h5 style={{ margin: '1em auto' }}>{description}</h5>
            </div>
        );
    }
);
PlaceholderImage.displayName = 'PlaceholderImage';
