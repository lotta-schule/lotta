import * as React from 'react';
import { Close } from '@material-ui/icons';
import { Button } from '../button/Button';
import clsx from 'clsx';

import styles from './tag.module.scss';

export interface TagProps {
    onDelete?: Function;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    role?: string;
}

export const Tag = React.memo<TagProps>(
    ({ onDelete, children, className, ...props }) => {
        return (
            <div
                data-testid={'Tag'}
                {...props}
                className={clsx(styles.root, className)}
            >
                {children}
                {onDelete && (
                    <Button
                        small
                        className={styles.deleteButton}
                        aria-label={`Tag ${children} löschen`}
                        onClick={() => onDelete()}
                        icon={<Close />}
                    />
                )}
            </div>
        );
    }
);
Tag.displayName = 'Tag';
