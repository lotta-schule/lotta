import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { FileModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, Button } from '@material-ui/core';
import { ImageContent } from '../ImageContent';

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
    return selectedFile && (
        <div className={styles.root}>
            <Button variant="outlined" size="large" color="secondary" className={styles.closeButton} onClick={onClose}>
                Schließen
            </Button>
            <ImageContent style={{ width: '80vw', marginLeft: '10vw' }} file={selectedFile} />
        </div>
    );
});