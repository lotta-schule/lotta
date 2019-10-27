import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from 'model';
import { ImageCarousel } from '../carousel/ImageCarousel';
import { Galery } from './Galery';

export interface CarouselProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Carousel: FunctionComponent<CarouselProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    if (isEditModeEnabled) {
        return (
            <Galery contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
        );
    }
    return (
        <ImageCarousel files={contentModule.files} filesConfiguration={(contentModule.configuration && contentModule.configuration.files) || {}} />
    );
});