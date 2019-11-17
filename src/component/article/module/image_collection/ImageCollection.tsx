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
    let shownContentModule = { ...contentModule };

    let oldImageCaptions: (string | null)[] = [];
    if (contentModule.text) {
        // debugger;
        // TODO: this is migration data and could probably be removed someday
        try {
            oldImageCaptions = JSON.parse(contentModule.text);
            if (oldImageCaptions instanceof Array) {
                shownContentModule = {
                    ...contentModule,
                    text: '',
                    configuration: {
                        ...contentModule.configuration,
                        files: (contentModule.files || []).reduce((prev, file, i) => ({
                            ...prev,
                            [file.id]: {
                                caption: oldImageCaptions[i] || '',
                                sortKey: i * 10
                            }
                        }), {})
                    }
                };
            }
        } catch { }
    } else if (!contentModule.configuration || !contentModule.configuration.files) {
        shownContentModule = {
            ...contentModule,
            configuration: {
                ...contentModule.configuration,
                files: (contentModule.files || []).reduce((prev, file, i) => ({
                    ...prev,
                    [file.id]: {
                        caption: oldImageCaptions[i] || '',
                        sortKey: i * 10
                    }
                }), {})
            }
        };
    }
    // TODO Migration Part /END

    return (
        <CardContent>
            {imageStyle === ImageStyle.GALLERY && (
                <Gallery isEditModeEnabled={!!isEditModeEnabled} contentModule={shownContentModule} onUpdateModule={onUpdateModule} />
            )}
            {imageStyle === ImageStyle.CAROUSEL && (
                <Carousel isEditModeEnabled={!!isEditModeEnabled} contentModule={shownContentModule} onUpdateModule={onUpdateModule} />
            )}
        </CardContent>
    );
});