import * as React from 'react';
import { Carousel } from './wrapper/Carousel';
import { Gallery } from './wrapper/Gallery';
import { ImageStyle } from './Config';
import { ContentModuleComponentProps } from '../ContentModule';

import styles from './ImageCollection.module.scss';

export const ImageCollection = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps<{
    caption: string[];
    imageStyle: ImageStyle;
  }>) => {
    // We should not need parseInt, but making sure it is really
    // a number is safer for not mismatching 1 and "1", for example
    const imageStyle = Number(
      contentModule.configuration?.imageStyle ?? ImageStyle.GALLERY
    ) as ImageStyle;

    return (
      <div className={styles.root} data-testid="ImageCollectionContentModule">
        {imageStyle === ImageStyle.GALLERY && (
          <Gallery
            isEditModeEnabled={!!isEditModeEnabled}
            contentModule={contentModule}
            onUpdateModule={onUpdateModule}
          />
        )}
        {imageStyle === ImageStyle.CAROUSEL && (
          <Carousel
            isEditModeEnabled={!!isEditModeEnabled}
            contentModule={contentModule}
            onUpdateModule={onUpdateModule}
          />
        )}
      </div>
    );
  }
);
ImageCollection.displayName = 'ImageCollection';
