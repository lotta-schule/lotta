import React, { memo } from 'react';
import { RenderElementProps } from 'slate-react';
import { makeStyles } from '@material-ui/core';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & { children: any };

const useStyles = makeStyles(theme => ({
    root: {
        float: 'right',
        maxWidth: '30%',
        margin: theme.spacing(1),
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%'
        }
    }
}));

export const SlateImage = memo<SlateImageProps>(({ element, attributes, children }) => {
    const styles = useStyles();
    // TODO: when editing the image, an image being edit can be recognized with `useFocused()`
    const src = element.src;
    const imageUrl = `https://afdptjdxen.cloudimg.io/width/400/foil1/${src}`;
    return (
        <span className={styles.root} {...attributes}>
            <span contentEditable={false}>
                <img src={imageUrl} alt={src} />
            </span>
            {children}
        </span>
    );
});