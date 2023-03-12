import * as React from 'react';
import {
    RenderElementProps,
    useReadOnly,
    useSelected,
    useSlateStatic,
} from 'slate-react';
import { Button, ButtonGroup } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import { Element, Transforms } from 'slate';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';
import { useImageUrl } from 'util/image/useImageUrl';
import { Image } from '../SlateCustomTypes';
import { File } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import clsx from 'clsx';

import styles from './SlateImage.module.scss';

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

        const imageWidth = React.useMemo(() => {
            switch (imageElement.size) {
                case 'large':
                    return 500;
                case 'small':
                    return 200;
                default:
                    // case 'middle'
                    return 300;
            }
        }, [imageElement.size]);

        const { url: imageUrl } = useImageUrl(src, {
            width: 400,
            resize: 'inside',
        });

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
            width: imageWidth,
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
                        src={imageUrl ?? ''}
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
                                icon={<Icon icon={faAlignLeft} />}
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
                                icon={<Icon icon={faAlignRight} />}
                            />
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button
                                small
                                selected={imageElement.size === 'large'}
                                onMouseDown={setElementOptions({
                                    size: 'large',
                                })}
                            >
                                XL
                            </Button>
                            <Button
                                small
                                selected={
                                    imageElement.size === 'middle' ||
                                    !imageElement.size
                                }
                                onMouseDown={setElementOptions({
                                    size: 'middle',
                                })}
                            >
                                M
                            </Button>
                            <Button
                                small
                                selected={imageElement.size === 'small'}
                                onMouseDown={setElementOptions({
                                    size: 'small',
                                })}
                            >
                                S
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
                {children}
            </span>
        );
    }
);
SlateImage.displayName = 'SlateImage';
