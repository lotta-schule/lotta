import React, { memo, useState } from 'react';
import { RenderElementProps, useReadOnly } from 'slate-react';
import { makeStyles, Theme } from '@material-ui/core';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & { children: any };

const useStyles = makeStyles<Theme, { isEditing: boolean }>(theme => ({
    root: {
        float: 'right',
        maxWidth: '30%',
        margin: theme.spacing(1),
        cursor: ({ isEditing }) => isEditing ? 'inherit' : 'pointer',
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%'
        }
    }
}));

export const SlateImage = memo<SlateImageProps>(({ element, attributes, children }) => {
    const isEditing = !useReadOnly();
    const styles = useStyles({ isEditing });
    const [showOverlay, setShowOverlay] = useState(false);

    const src = element.src;
    const imageUrl = `https://afdptjdxen.cloudimg.io/width/400/foil1/${src}`;
    return (
        <span className={styles.root} {...attributes}>
            <span contentEditable={false}>
                <img src={imageUrl} alt={src} onClick={isEditing ? undefined : (() => setShowOverlay(true))} />
                {showOverlay && (
                    <ImageOverlay
                        selectedUrl={showOverlay ? src : null}
                        onClose={() => setShowOverlay(false)}
                    />
                )}
            </span>
            {children}
        </span>
    );
});