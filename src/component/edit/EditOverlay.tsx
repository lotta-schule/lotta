import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { Clear } from '@material-ui/icons';
import { Button } from 'component/general/button/Button';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: `2px solid ${theme.palette.secondary.main}`,
        position: 'relative',
        '&:hover > div': {
            display: 'flex',
        },
    },
    overlay: {
        backgroundColor: fade(theme.palette.grey[200], 0.4),
        backdropFilter: 'blur(10px)',
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    removeButton: {
        border: 'none',
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
    },
}));

interface EditOverlayProps {
    label: string;
    onClick(event: React.MouseEvent<HTMLButtonElement>): void;
    onClickRemove?(event: React.MouseEvent<HTMLButtonElement>): void;
    children?: any;
}

export const EditOverlay = React.memo<EditOverlayProps>(
    ({ children, label, onClickRemove, onClick }) => {
        const styles = useStyles();
        return (
            <div className={styles.root}>
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
