import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from 'model';
import { ImageCarousel } from '../carousel/ImageCarousel';
import { Gallery } from './Gallery';

export interface CarouselProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Carousel: FunctionComponent<CarouselProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    if (isEditModeEnabled) {
        return (
            <Gallery contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
        );
    }
    return (
        <ImageCarousel files={contentModule.files} filesConfiguration={(contentModule.configuration && contentModule.configuration.files) || {}} />
    );
});