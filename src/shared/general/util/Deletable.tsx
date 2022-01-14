import * as React from 'react';
import { Close } from '@material-ui/icons';
import { Button } from '../button/Button';
import clsx from 'clsx';

import styles from './Deletable.module.scss';

export interface DeletableProps
    extends Omit<React.HTMLProps<HTMLDivElement>, 'onClick'> {
    className?: string;
    title?: string;
    onDelete?: React.MouseEventHandler<HTMLButtonElement> | null;
}

export const Deletable: React.FC<DeletableProps> = ({
    children,
    onDelete,
    title = 'löschen',
    className,
    ...props
}) => {
    return (
        <div className={clsx(styles.root, className)} {...props}>
            {onDelete && (
                <Button
                    small
                    className={styles.button}
                    icon={<Close />}
                    title={title}
                    onClick={onDelete ?? undefined}
                />
            )}
            {children}
        </div>
    );
};
