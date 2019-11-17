import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { makeStyles, Theme, Button } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';

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
    }
}));

interface EditOverlayProps {
    label: string;
    onClick(event: MouseEvent<HTMLButtonElement>): void;
}

export const EditOverlay: FunctionComponent<EditOverlayProps> = memo(({ children, label, onClick }) => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <div className={styles.overlay}>
                <Button variant={'contained'} color={'secondary'} onClick={onClick}>{label}</Button>
            </div>
            {children}
        </div>
    );
});