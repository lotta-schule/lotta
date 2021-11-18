import * as React from 'react';
import { Clear } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';

import styles from './EditOverlay.module.scss';

interface EditOverlayProps {
    label: string;
    style?: React.CSSProperties;
    onClick(event: React.MouseEvent<HTMLButtonElement>): void;
    onClickRemove?(event: React.MouseEvent<HTMLButtonElement>): void;
    children?: any;
}

export const EditOverlay = React.memo<EditOverlayProps>(
    ({ children, label, onClickRemove, style, onClick }) => {
        return (
            <div
                className={styles.root}
                style={style}
                data-testid={'EditOverlay'}
            >
                <div className={styles.overlay}>
                    {!!onClickRemove && (
                        <Button
                            aria-label={'remove'}
                            className={styles.removeButton}
                            onClick={onClickRemove}
                            icon={<Clear />}
                        />
                    )}
                    <Button onClick={onClick}>{label}</Button>
                </div>
                {children}
            </div>
        );
    }
);
EditOverlay.displayName = 'EditOverlay';
