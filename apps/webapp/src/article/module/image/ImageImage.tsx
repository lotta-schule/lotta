import * as React from 'react';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { FileModel } from 'model';
import { ImageContent, ImageContentProps } from './ImageContent';
import { ImageCaption } from './ImageCaption';

import styles from './ImageImage.module.scss';

interface ImageImageProps
  extends Omit<ImageContentProps, 'onClick' | 'alt' | 'file'> {
  animateOnLoad?: boolean;
  isEditModeEnabled: boolean;
  file?: FileModel | null;
  caption: string;
  isUsingFullHeight?: boolean;
  onUpdateFile(file: FileModel): void;
  onUpdateCaption(caption: string): void;
  onSelect?(e: React.MouseEvent<HTMLImageElement>): void;
}

export const ImageImage = React.memo(
  ({
    isEditModeEnabled,
    file,
    caption,
    isUsingFullHeight,
    onUpdateFile,
    onUpdateCaption,
    onSelect,
    ...otherProps
  }: ImageImageProps) => {
    const imageContent = React.useMemo(
      () =>
        isEditModeEnabled ? (
          <SelectFileOverlay
            label={'Bild wechseln'}
            fileFilter={(f) => f.fileType === 'IMAGE'}
            onSelectFile={onUpdateFile}
          >
            <ImageContent alt={caption} file={file} {...otherProps} />
          </SelectFileOverlay>
        ) : (
          <ImageContent
            alt={caption}
            onClick={onSelect}
            isUsingFullHeight={!isEditModeEnabled && isUsingFullHeight}
            file={file}
            {...otherProps}
          />
        ),
      [
        isEditModeEnabled,
        file,
        caption,
        isUsingFullHeight,
        onUpdateFile,
        onSelect,
        otherProps,
      ]
    );
    return (
      <figure className={styles.root}>
        {imageContent}
        <ImageCaption
          isEditModeEnabled={isEditModeEnabled}
          value={caption}
          onUpdate={onUpdateCaption}
        />
      </figure>
    );
  }
);
ImageImage.displayName = 'ImageImage';
