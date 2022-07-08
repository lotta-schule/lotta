import * as React from 'react';
import {
    RenderElementProps,
    useReadOnly,
    useSelected,
    useSlateStatic,
} from 'slate-react';
import { Button, ButtonGroup } from '@lotta-schule/hubert';
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
import { File } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import getConfig from 'next/config';
import clsx from 'clsx';

import styles from './SlateImage.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export type SlateImageProps = Omit<RenderElementProps, 'children'> & {
    children: any;
};

export const SlateImage = React.memo<SlateImageProps>(
    ({ element, attributes, children }) => {
        const imageElement = element as Image;
        const isEditing = !useReadOnly();
        const editor = useSlateStatic();
        const isSelected = useSelected();
        const { baseUrl } = useServerData();
        const [showOverlay, setShowOverlay] = React.useState(false);

        const src =
            imageElement.src ??
            File.getFileRemoteLocation(baseUrl, {
                id: imageElement.fileId,
            } as any);
        const imageUrl = `https://${cloudimageToken}.cloudimg.io/width/400/foil1/${src}`;

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

        const style: React.CSSProperties = {
            float: imageElement.alignment === 'left' ? 'left' : 'right',
            maxWidth: (() => {
                switch (imageElement.size) {
                    case 'large':
                        return '50%';
                    case 'small':
                        return '20%';
                    default:
                        // case 'middle'
                        return '30%';
                }
            })(),
        };

        return (
            <span
                className={clsx(styles.root, {
                    [styles.isEditing]: isEditing,
                    [styles.isSelected]: isSelected,
                })}
                style={style}
                {...attributes}
            >
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
                        <ButtonGroup>
                            <Button
                                small
                                selected={imageElement.alignment === 'left'}
                                value={'left'}
                                onMouseDown={setElementOptions({
                                    alignment: 'left',
                                })}
                                icon={<FormatAlignLeft />}
                            />
                            <Button
                                small
                                selected={
                                    imageElement.alignment === 'right' ||
                                    imageElement.alignment === undefined
                                }
                                onMouseDown={setElementOptions({
                                    alignment: 'right',
                                })}
                                icon={<FormatAlignRight />}
                            />
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button
                                small
                                selected={imageElement.size === 'large'}
                                onMouseDown={setElementOptions({
                                    size: 'large',
                                })}
                                icon={<PhotoSizeSelectActual />}
                            />
                            <Button
                                small
                                selected={
                                    imageElement.size === 'middle' ||
                                    !imageElement.size
                                }
                                onMouseDown={setElementOptions({
                                    size: 'middle',
                                })}
                                icon={<PhotoSizeSelectLarge />}
                            />
                            <Button
                                small
                                selected={imageElement.size === 'small'}
                                onMouseDown={setElementOptions({
                                    size: 'small',
                                })}
                                icon={<PhotoSizeSelectSmall />}
                            />
                        </ButtonGroup>
                    </div>
                )}
                {children}
            </span>
        );
    }
);
SlateImage.displayName = 'SlateImage';
