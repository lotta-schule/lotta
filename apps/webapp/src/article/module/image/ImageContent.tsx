import * as React from 'react';
import { File } from 'util/model';
import { FileModel } from 'model';
import {
  ResponsiveImage,
  ResponsiveImageProps,
} from 'util/image/ResponsiveImage';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import clsx from 'clsx';

import styles from './ImageContent.module.scss';

export type ImageContentProps = {
  file?: FileModel | null;
  isUsingFullHeight?: boolean;
  alt: string;
} & Omit<ResponsiveImageProps, 'src' | 'alt' | 'ref'>;

export const ImageContent = React.memo(
  ({ file, isUsingFullHeight, className, ...props }: ImageContentProps) => {
    const { baseUrl } = useServerData();
    const imageSource = file ? File.getFileRemoteLocation(baseUrl, file) : null;
    return imageSource ? (
      <ResponsiveImage
        src={imageSource}
        width={400}
        sizes={'(max-width: 960px) 80vw, 80vw'}
        {...props}
        className={clsx(
          {
            [styles.isClickable]: !!props.onClick,
            [styles.isUsingFullHeight]: isUsingFullHeight,
          },
          styles.root,
          className
        )}
      />
    ) : (
      <PlaceholderImage height={350} />
    );
  }
);
ImageContent.displayName = 'ImageContent';
