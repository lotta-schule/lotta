import * as React from 'react';
import {
  RenderElementProps,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';
import { Button, ButtonGroup } from '@lotta-schule/hubert';
import { Icon } from '#/shared/Icon';
import { faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import { Element, Transforms } from 'slate';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';
import { Image } from '../SlateCustomTypes';
import { useImageElement } from './useImageElement';
import { ResponsiveImage } from '#/util/image/ResponsiveImage';
import clsx from 'clsx';

import styles from './SlateImage.module.scss';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & {
  children: any;
};

export { GET_FILE_FORMATS } from './useImageElement';

export const SlateImage = React.memo(
  ({ element, attributes, children }: SlateImageProps) => {
    const imageElement = element as Image;
    const isEditing = !useReadOnly();
    const editor = useSlateStatic();
    const isSelected = useSelected();
    const [showOverlay, setShowOverlay] = React.useState(false);

    const { file, style } = useImageElement(imageElement);

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
      <span
        className={clsx(styles.root, {
          [styles.isEditing]: isEditing,
          [styles.isSelected]: isSelected,
        })}
        style={style}
        {...attributes}
      >
        <span contentEditable={false}>
          <ResponsiveImage
            lazy
            src={imageElement.fileId ? undefined : imageElement.src}
            file={file as any}
            alt={''}
            format="preview"
            onClick={isEditing ? undefined : () => setShowOverlay(true)}
          />
          {showOverlay && (
            <ImageOverlay
              selectedFile={showOverlay ? file : null}
              onClose={() => setShowOverlay(false)}
            />
          )}
        </span>
        {isSelected && isEditing && (
          <div
            style={{
              position: 'absolute',
              right: '.15em',
              top: '.15em',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ButtonGroup className={styles.buttonGroup}>
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
                selected={imageElement.size === 'middle' || !imageElement.size}
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
