import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { makeStyles, Theme, Button, IconButton } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { Clear } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: `2px solid ${theme.palette.secondary.main}`,
        position: 'relative',
        '&:hover > div': {
            display: 'flex'
        }
    },
    overlay: {
        backgroundColor: fade(theme.palette.grey[200], .4),
        backdropFilter: 'blur(10px)',
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    removeButton: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1)
    }
}));

interface EditOverlayProps {
    label: string;
    onClick(event: MouseEvent<HTMLButtonElement>): void;
    onClickRemove?(event: MouseEvent<HTMLButtonElement>): void;
}

export const EditOverlay: FunctionComponent<EditOverlayProps> = memo(({ children, label, onClickRemove, onClick }) => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <div className={styles.overlay}>
                {!!onClickRemove && (
                    <IconButton aria-label={'remove'} className={styles.removeButton} size={'small'} onClick={onClickRemove}>
                        <Clear fontSize={'inherit'} />
                    </IconButton>
                )}
                <Button variant={'contained'} color={'secondary'} onClick={onClick}>{label}</Button>
            </div>
            {children}
        </div>
    );
});