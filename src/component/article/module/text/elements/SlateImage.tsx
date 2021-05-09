import * as React from 'react';
import {
    RenderElementProps,
    useReadOnly,
    useSelected,
    useSlateStatic,
} from 'slate-react';
import { makeStyles, Theme } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
    FormatAlignRight,
    FormatAlignLeft,
    PhotoSizeSelectSmall,
    PhotoSizeSelectLarge,
    PhotoSizeSelectActual,
} from '@material-ui/icons';
import { Element, Transforms } from 'slate';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';
import { Image } from '../SlateCustomTypes';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & {
    children: any;
};

const useStyles = makeStyles<
    Theme,
    {
        isEditing: boolean;
        isSelected: boolean;
        alignment?: string;
        size?: string;
    }
>((theme) => ({
    root: {
        position: 'relative',
        float: ({ alignment }) => (alignment === 'left' ? 'left' : 'right'),
        boxSizing: 'border-box',
        maxWidth: ({ size }) => {
            switch (size) {
                case 'large':
                    return '50%';
                case 'small':
                    return '20%';
                default:
                    // case 'middle'
                    return '30%';
            }
        },
        margin: theme.spacing(1),
        cursor: ({ isEditing }) => (isEditing ? 'inherit' : 'pointer'),
        border: ({ isSelected }) =>
            isSelected ? `1px solid ${theme.palette.secondary.main}` : 'none',
        '& img': {
            maxWidth: '100%',
            maxHeight: '100%',
        },
    },
}));

export const SlateImage = React.memo<SlateImageProps>(
    ({ element, attributes, children }) => {
        const imageElement = element as Image;
        const isEditing = !useReadOnly();
        const editor = useSlateStatic();
        const isSelected = useSelected();
        const styles = useStyles({ isEditing, isSelected, ...element });
        const [showOverlay, setShowOverlay] = React.useState(false);

        const src = imageElement.src;
        const imageUrl = `https://afdptjdxen.cloudimg.io/width/400/foil1/${src}`;

        const setElementOptions = React.useCallback(
            (options: Partial<Image>) => {
                return (e: React.MouseEvent<any>) => {
                    e.preventDefault();
                    Transforms.setNodes(editor, options, {
                        match: (node) => (node as Element).type === 'image',
                    });
                };
            },
            [editor]
        );

        return (
            <span className={styles.root} {...attributes}>
                <span contentEditable={false}>
                    <img
                        src={imageUrl}
                        alt={src}
                        onClick={
                            isEditing ? undefined : () => setShowOverlay(true)
                        }
                    />
                    {showOverlay && (
                        <ImageOverlay
                            selectedUrl={showOverlay ? src : null}
                            onClose={() => setShowOverlay(false)}
                        />
                    )}
                </span>
                {isSelected && (
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <ToggleButtonGroup
                            size={'small'}
                            value={imageElement.alignment ?? 'right'}
                        >
                            <ToggleButton
                                value={'left'}
                                onMouseDown={setElementOptions({
                                    alignment: 'left',
                                })}
                            >
                                <FormatAlignLeft />
                            </ToggleButton>
                            <ToggleButton
                                value={'right'}
                                onMouseDown={setElementOptions({
                                    alignment: 'right',
                                })}
                            >
                                <FormatAlignRight />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <ToggleButtonGroup
                            size={'small'}
                            value={imageElement.size ?? 'middle'}
                        >
                            <ToggleButton
                                value={'large'}
                                onMouseDown={setElementOptions({
                                    size: 'large',
                                })}
                            >
                                <PhotoSizeSelectActual />
                            </ToggleButton>
                            <ToggleButton
                                value={'middle'}
                                onMouseDown={setElementOptions({
                                    size: 'middle',
                                })}
                            >
                                <PhotoSizeSelectLarge />
                            </ToggleButton>
                            <ToggleButton
                                value={'small'}
                                onMouseDown={setElementOptions({
                                    size: 'small',
                                })}
                            >
                                <PhotoSizeSelectSmall />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                )}
                {children}
            </span>
        );
    }
);
