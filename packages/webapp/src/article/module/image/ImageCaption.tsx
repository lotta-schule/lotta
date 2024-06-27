import * as React from 'react';
import { Input } from '@lotta-schule/hubert';

import styles from './ImageCaption.module.scss';

interface ImageCaptionProps {
  isEditModeEnabled: boolean;
  value: string;
  onUpdate(caption: string): void;
}

export const ImageCaption = React.memo<ImageCaptionProps>(
  ({ isEditModeEnabled, value, onUpdate }) => {
    if (isEditModeEnabled) {
      return (
        <figcaption className={styles.root}>
          <Input
            contentEditable
            placeholder={'Bildbeschreibung'}
            defaultValue={value}
            className={styles.figcaption}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
              onUpdate(e.currentTarget.value)
            }
          />
        </figcaption>
      );
    }
    return (
      <figcaption className={styles.root}>
        <span>{value}</span>
      </figcaption>
    );
  }
);
ImageCaption.displayName = 'ImageCaption';
