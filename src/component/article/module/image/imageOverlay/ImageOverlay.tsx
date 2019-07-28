import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { FileModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, Button } from '@material-ui/core';
import { useWindowSize } from 'util/useWindowSize';

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
        backgroundColor: '#333e',
    },
    image: {
        width: '80vw',
        height: '80vh',
    },
    closeButton: {
        position: 'absolute',
        top: '.25em',
        right: '.25em',
        backgroundColor: '#111',
        borderRadius: 0,
        '&:hover': {
            backgroundColor: '#333',
        }
    }
}));

export interface ImageOverlayProps {
    selectedFile: FileModel | null;
    onClose(e: MouseEvent<HTMLButtonElement>): void;
}

export const ImageOverlay: FunctionComponent<ImageOverlayProps> = memo(({ selectedFile, onClose }) => {
    const styles = useStyles();
    const { innerHeight, innerWidth } = useWindowSize();
    const [width, height] = [Math.floor(innerWidth * .8), Math.floor(innerHeight * .8)];

    if (!selectedFile) {
        return null;
    }
    const imgUrl = `https://afdptjdxen.cloudimg.io/bound/${width}x${height}/foil1/${selectedFile.remoteLocation}`;
    return (
        <div className={styles.root}>
            <Button variant="outlined" size="large" color="secondary" className={styles.closeButton} onClick={onClose}>
                Schließen
            </Button>
            <img src={imgUrl} alt={''} />
        </div>
    );
});