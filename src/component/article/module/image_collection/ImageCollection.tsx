import React, { FunctionComponent, memo } from 'react';
import { CardContent } from '@material-ui/core';
import { Carousel } from './wrapper/Carousel';
import { ContentModuleModel } from '../../../../model';
import { Gallery } from './wrapper/Gallery';
import { get } from 'lodash';
import { ImageStyle } from './Config';

export interface ImageProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const ImageCollection: FunctionComponent<ImageProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => {
    const imageStyle: ImageStyle = get(contentModule.configuration, 'imageStyle', ImageStyle.GALLERY);
    return (
        <CardContent>
            {imageStyle === ImageStyle.GALLERY && (
                <Gallery isEditModeEnabled={!!isEditModeEnabled} contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
            {imageStyle === ImageStyle.CAROUSEL && (
                <Carousel isEditModeEnabled={!!isEditModeEnabled} contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
        </CardContent>
    );
});