import React, { FunctionComponent, memo, MouseEvent, useEffect, KeyboardEventHandler, KeyboardEvent, useCallback } from 'react';
import { FileModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, IconButton } from '@material-ui/core';
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
        backgroundColor: theme.palette.background.paper,
    },
    closeButton: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        '&:hover': {
            backgroundColor: theme.palette.secondary.light,
        }
    },
    leftButton: {
        position: 'absolute',
        left: theme.spacing(1),
    },
    rightButton: {
        position: 'absolute',
        right: theme.spacing(1),
    }
}));

export interface ImageOverlayProps {
    selectedFile: FileModel | null;
    onPrevious?(e: MouseEvent<HTMLButtonElement> | KeyboardEvent<Window>): void;
    onNext?(e: MouseEvent<HTMLButtonElement> | KeyboardEvent<Window>): void;
    onClose(e: MouseEvent<HTMLButtonElement> | KeyboardEvent<Window>): void;
}

export const ImageOverlay: FunctionComponent<ImageOverlayProps> = memo(({ selectedFile, onPrevious, onNext, onClose }) => {
    useLockBodyScroll();
    const styles = useStyles();
    const { innerHeight, innerWidth } = useWindowSize();
    const [width, height] = [Math.floor(innerWidth * .8), Math.floor(innerHeight * .8)];

    const onKeyDown: KeyboardEventHandler<Window> = useCallback(event => {
        if (event.keyCode === 27) { // ESC
            onClose(event);
        } else if (event.keyCode === 37 && onPrevious) { // <-
            onPrevious(event);
        } else if (event.keyCode === 39 && onNext) { // ->
            onNext(event);
        }
    }, [onClose, onNext, onPrevious]);

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown as any);
        return () => {
            window.removeEventListener('keydown', onKeyDown as any);
        };

    }, [onKeyDown]);

    if (!selectedFile) {
        return null;
    }
    const imgUrl = `https://afdptjdxen.cloudimg.io/bound/${width}x${height}/foil1/${selectedFile.remoteLocation}`;
    return (
        <div className={styles.root}>
            <IconButton size="medium" color={'secondary'} className={styles.closeButton} onClick={onClose}>
                <Close />
            </IconButton>
            {onPrevious && (
                <IconButton size={'small'} color={'secondary'} className={styles.leftButton} onClick={onPrevious}>
                    <ChevronLeft />
                </IconButton>
            )}
            {onNext && (
                <IconButton size={'small'} color={'secondary'} className={styles.rightButton} onClick={onNext}>
                    <ChevronRight />
                </IconButton>
            )}
            <img src={imgUrl} alt={''} />
        </div>
    );
});