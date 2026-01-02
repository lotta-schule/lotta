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
import { Image } from '../SlateCustomTypes';
import { graphql } from 'api/graphql';
import { useQuery } from '@apollo/client/react';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import clsx from 'clsx';

import styles from './SlateImage.module.scss';

export type SlateImageProps = Omit<RenderElementProps, 'children'> & {
  children: any;
};

export const GET_FILE_FORMATS = graphql(`
  query GET_FILE($id: ID!) {
    file(id: $id) {
      id
      formats(category: "PREVIEW") {
        availability {
          status
        }
        name
        type
        url
      }
    }
  }
`);

export const SlateImage = React.memo(
  ({ element, attributes, children }: SlateImageProps) => {
    const imageElement = element as Image;
    const isEditing = !useReadOnly();
    const editor = useSlateStatic();
    const isSelected = useSelected();
    const [showOverlay, setShowOverlay] = React.useState(false);

    const { data } = useQuery(GET_FILE_FORMATS, {
      variables: {
        id: imageElement.fileId as string,
      },
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-only',
      skip: !imageElement.fileId,
    });

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
          <ResponsiveImage
            lazy
            src={imageElement.fileId ? undefined : imageElement.src}
            file={data?.file as any}
            alt={''}
            format="preview"
            onClick={isEditing ? undefined : () => setShowOverlay(true)}
          />
          {showOverlay && (
            <ImageOverlay
              selectedFile={showOverlay ? data?.file : null}
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
