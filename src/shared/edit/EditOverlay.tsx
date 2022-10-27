import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';

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
                            icon={<Icon icon={faXmark} size={'lg'} />}
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
