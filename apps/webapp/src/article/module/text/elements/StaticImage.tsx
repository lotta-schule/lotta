import * as React from 'react';
import { ImageOverlay } from '../../image_collection/imageOverlay/ImageOverlay';
import { ResponsiveImage } from '#/util/image/ResponsiveImage';
import { Image } from '../SlateCustomTypes';
import { useImageElement } from './useImageElement';

import styles from './SlateImage.module.scss';

export type StaticImageProps = {
  element: Image;
};

/** Read-only counterpart of SlateImage, without the editor. */
export const StaticImage = React.memo(({ element }: StaticImageProps) => {
  const { file, style } = useImageElement(element);
  const [showOverlay, setShowOverlay] = React.useState(false);

  return (
    <span className={styles.root} style={style}>
      <span>
        <ResponsiveImage
          lazy
          src={element.fileId ? undefined : element.src}
          file={file as any}
          alt={''}
          format="preview"
          onClick={() => setShowOverlay(true)}
        />
        {showOverlay && (
          <ImageOverlay
            selectedFile={file}
            onClose={() => setShowOverlay(false)}
          />
        )}
      </span>
    </span>
  );
});
StaticImage.displayName = 'StaticImage';
