import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent } from '@material-ui/core';
import { ImageStyle } from './Config';
import { get } from 'lodash';
import { Single } from './wrapper/Single';
import { Galery } from './wrapper/Galery';
import { Carousel } from './wrapper/Carousel';

export interface ImageProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Image: FunctionComponent<ImageProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => {
    const imageStyle: ImageStyle = get(contentModule.configuration, 'imageStyle', ImageStyle.SINGLE);
    return (
        <CardContent>
            {imageStyle === ImageStyle.SINGLE && (
                <Single isEditModeEnabled={!!isEditModeEnabled} contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
            {imageStyle === ImageStyle.GALERY && (
                <Galery isEditModeEnabled={!!isEditModeEnabled} contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
            {imageStyle === ImageStyle.CAROUSEL && (
                <Carousel isEditModeEnabled={!!isEditModeEnabled} contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
        </CardContent>
    );
});