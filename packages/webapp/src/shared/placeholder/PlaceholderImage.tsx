import * as React from 'react';
import clsx from 'clsx';

import styles from './PlaceholderImage.module.scss';

export type PlaceholderImageProps = {
  height?: number | string;
  width?: number | string;
  aspectRatio?: number;
  icon?: 'video' | 'image';
  description?: string | React.ReactElement;
};

export const PlaceholderImage = React.memo(
  ({
    height,
    icon,
    description,
    width,
    aspectRatio = width ? undefined : 16 / 9,
  }: PlaceholderImageProps) => {
    const iconSource =
      icon === 'video' ? '/img/SwitchVideo.svg' : '/img/Photo.svg';
    return (
      <div
        data-testid="placeholder-image"
        style={{
          height,
          width,
          aspectRatio,
          backgroundImage: `url(${iconSource})`,
        }}
        className={clsx(styles.root, {
          [styles.withDescription]: !!description,
        })}
      >
        <h5>{description}</h5>
      </div>
    );
  }
);
PlaceholderImage.displayName = 'PlaceholderImage';
