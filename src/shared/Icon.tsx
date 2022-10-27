import * as React from 'react';
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import styles from './Icon.module.scss';

export type IconProps = Omit<FontAwesomeIconProps, 'size'> & {
    size?: FontAwesomeIconProps['size'] | 'xl';
    color?: 'primary' | 'secondary';
};

export const Icon = React.memo<IconProps>((props) => {
    return (
        <span
            className={clsx(styles.root, {
                [styles.secondaryColor]: props.color == 'secondary',
            })}
        >
            <FontAwesomeIcon {...(props as FontAwesomeIconProps)} />
        </span>
    );
});
Icon.displayName = 'Icon';
