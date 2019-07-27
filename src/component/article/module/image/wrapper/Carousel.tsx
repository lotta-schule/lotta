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
    let imageCaptions: (string | null)[];
    try {
        imageCaptions = JSON.parse(contentModule.text!);
    } catch {
        imageCaptions = [contentModule.text || null];
    }
    if (isEditModeEnabled) {
        return (
            <Galery contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
        );
    }
    return (
        <ImageCarousel files={contentModule.files} captions={imageCaptions} />
    );
});