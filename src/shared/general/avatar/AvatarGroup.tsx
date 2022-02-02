import * as React from 'react';
import { AvatarProps } from '@material-ui/core';
import clsx from 'clsx';

import styles from './AvatarGroup.module.scss';

export interface AvatarGroupProps {
    children: React.ReactElement<AvatarProps>[];

    /**
     * The maximum number of avatars to show
     */
    max?: number;
}

/**
 * Primary UI shared for userAvatar interaction
 */

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    max = 3,
    children,
    ...props
}) => {
    const avatars = React.Children.toArray(
        children
    ) as React.ReactElement<AvatarProps>[];
    const overshoot = avatars.length - max;
    console.log(avatars);
    return (
        <div className={styles.root}>
            <div role={'group'}>
                {avatars.splice(0, max).map((child, index) => {
                    return React.cloneElement(child, {
                        key: child.props.key ?? index,
                        className: clsx(child.props.className, styles.avatar),
                    });
                })}
            </div>
            {overshoot > 0 && (
                <div className={styles.overshoot}>+{overshoot}</div>
            )}
        </div>
    );
};
