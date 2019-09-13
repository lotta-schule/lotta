import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { FileModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, Button, Fab, IconButton } from '@material-ui/core';
import { useWindowSize } from 'util/useWindowSize';
import { useLockBodyScroll } from 'util/useLockBodyScroll';
import { Close, ChevronLeft, ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        backgroundColor: '#fff',
    },
    image: {
        width: '80vw',
        height: '80vh',
    },
    closeButton: {
        position: 'absolute',
        top: '.25em',
        right: '3%',
        '&:hover': {
            backgroundColor: theme.palette.secondary.light,
        }
    },
    leftButton: {
        position: 'absolute',
        left: '3%',
    },
    rightButton: {
        position: 'absolute',
        right: '3%',
    }
}));

export interface ImageOverlayProps {
    selectedFile: FileModel | null;
    onClose(e: MouseEvent<HTMLButtonElement>): void;
}

export const ImageOverlay: FunctionComponent<ImageOverlayProps> = memo(({ selectedFile, onClose }) => {
    useLockBodyScroll();
    const styles = useStyles();
    const { innerHeight, innerWidth } = useWindowSize();
    const [width, height] = [Math.floor(innerWidth * .8), Math.floor(innerHeight * .8)];

    if (!selectedFile) {
        return null;
    }
    const imgUrl = `https://afdptjdxen.cloudimg.io/bound/${width}x${height}/foil1/${selectedFile.remoteLocation}`;
    return (
        <div className={styles.root}>
            <IconButton size="medium" color="secondary" className={styles.closeButton} onClick={onClose}>
                <Close />
            </IconButton>
            <IconButton size="small" color="secondary" className={styles.leftButton}>
                <ChevronLeft />
            </IconButton>
            <IconButton size="small" color="secondary" className={styles.rightButton}>
                <ChevronRight />
            </IconButton>
            <img src={imgUrl} alt={''} style={{ width: '75%' }} />
        </div>
    );
});