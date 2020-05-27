import React, { memo, useState, useCallback, MouseEvent } from 'react';
import { RenderElementProps, useReadOnly, useSelected, useEditor } from 'slate-react';
import { makeStyles, Theme } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
    FormatAlignRight,
    FormatAlignLeft,
    PhotoSizeSelectSmall,
    PhotoSizeSelectLarge,
    PhotoSizeSelectActual
} from '@material-ui/icons';
import { Transforms } from 'slate';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & { children: any };

const useStyles = makeStyles<Theme, { isEditing: boolean; isSelected: boolean; alignment?: string; size?: string; }>(theme => ({
    root: {
        position: 'relative',
        float: ({ alignment }) => alignment === 'left' ? 'left' : 'right',
        boxSizing: 'border-box',
        maxWidth: ({ size }) => {
            switch (size) {
                case 'large':
                    return '50%';
                case 'small':
                    return '20%';
                default: // case 'middle'
                    return '30%';
            }
        },
        margin: theme.spacing(1),
        cursor: ({ isEditing }) => isEditing ? 'inherit' : 'pointer',
        border: ({ isSelected }) => isSelected ? `1px solid ${theme.palette.secondary.main}` : 'none',
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%'
        }
    }
}));

export const SlateImage = memo<SlateImageProps>(({ element, attributes, children }) => {
    const isEditing = !useReadOnly();
    const editor = useEditor();
    const isSelected = useSelected();
    const styles = useStyles({ isEditing, isSelected, ...element });
    const [showOverlay, setShowOverlay] = useState(false);

    const src = element.src as string;
    const imageUrl = `https://afdptjdxen.cloudimg.io/width/400/foil1/${src}`;

    const setElementOptions = useCallback((options: { alignment?: string; size?: string }) => {
        return (e: MouseEvent<any>) => {
            e.preventDefault();
            Transforms.setNodes(
                editor,
                options,
                {
                    match: node => node.type === 'image'
                }
            );
        }
    }, [editor]);

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
            {isSelected && (
                <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
                    <ToggleButtonGroup size={'small'} value={element.alignment ?? 'right'}>
                        <ToggleButton value={'left'} onMouseDown={setElementOptions({ alignment: 'left' })}>
                            <FormatAlignLeft />
                        </ToggleButton>
                        <ToggleButton value={'right'} onMouseDown={setElementOptions({ alignment: 'right' })}>
                            <FormatAlignRight />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup size={'small'} value={element.size ?? 'middle'}>
                        <ToggleButton value={'large'} onMouseDown={setElementOptions({ size: 'large' })}>
                            <PhotoSizeSelectActual />
                        </ToggleButton>
                        <ToggleButton value={'middle'} onMouseDown={setElementOptions({ size: 'middle' })}>
                            <PhotoSizeSelectLarge />
                        </ToggleButton>
                        <ToggleButton value={'small'} onMouseDown={setElementOptions({ size: 'small' })}>
                            <PhotoSizeSelectSmall />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
            )
            }
            {children}
        </span >
    );
});