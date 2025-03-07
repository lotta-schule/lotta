import * as React from 'react';
import { FileModel } from 'model';
import {
  ResponsiveImage,
  ResponsiveImageProps,
} from 'util/image/ResponsiveImage';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import clsx from 'clsx';

import styles from './ImageContent.module.scss';

export type ImageContentProps = {
  file?: FileModel | null;
  isUsingFullHeight?: boolean;
  alt: string;
} & Omit<ResponsiveImageProps, 'src' | 'alt' | 'ref'>;

export const ImageContent = React.memo(
  ({
    file,
    isUsingFullHeight,
    className,
    format,
    ...props
  }: ImageContentProps) => {
    return (
      <ResponsiveImage
        file={file}
        format={format || 'preview'}
        {...props}
        className={clsx(
          {
            [styles.isClickable]: !!props.onClick,
            [styles.isUsingFullHeight]: isUsingFullHeight,
          },
          styles.root,
          className
        )}
        fallback={<PlaceholderImage height={350} />}
      />
    );
  }
);
ImageContent.displayName = 'ImageContent';
