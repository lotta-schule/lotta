import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.css';

export interface AvatarProps {
    /**
     * The avatar image source
     */
    src: string;

    /**
     * The title of the avatar
     */
    title?: string;

    className?: string;

    style?: React.CSSProperties;
}

/**
 * Primary UI shared for userAvatar interaction
 */

export const Avatar = React.memo<AvatarProps>(
    ({ src, title, className, style }) => {
        return (
            <div
                role={'img'}
                title={title}
                className={clsx(styles.root, className)}
                style={{ ...style, backgroundImage: `url(${src})` }}
            />
        );
    }
);
Avatar.displayName = 'Avatar';
