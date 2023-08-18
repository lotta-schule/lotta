import * as React from 'react';
import { ContentModuleModel } from 'model';
import { ImageCarousel } from '../carousel/ImageCarousel';
import { Gallery } from './Gallery';

export interface CarouselProps {
  contentModule: ContentModuleModel;
  isEditModeEnabled: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Carousel = React.memo<CarouselProps>(
  ({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    if (isEditModeEnabled) {
      return (
        <Gallery
          contentModule={contentModule}
          isEditModeEnabled={isEditModeEnabled}
          onUpdateModule={onUpdateModule}
        />
      );
    }
    return <ImageCarousel contentModule={contentModule} />;
  }
);
Carousel.displayName = 'Carousel';
