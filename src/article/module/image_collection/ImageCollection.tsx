import * as React from 'react';
import { Carousel } from './wrapper/Carousel';
import { ContentModuleModel } from '../../../model';
import { Gallery } from './wrapper/Gallery';
import { ImageStyle } from './Config';
import get from 'lodash/get';

import styles from './ImageCollection.module.scss';

export interface ImageProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (
        contentModule: ContentModuleModel<{ captions: string[] }>
    ) => void;
}

export const ImageCollection = React.memo<ImageProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => {
        const imageStyle: ImageStyle = get(
            contentModule.configuration,
            'imageStyle',
            ImageStyle.GALLERY
        );
        let shownContentModule = { ...contentModule };

        let oldImageCaptions: (string | null)[] = [];
        if (contentModule.content) {
            // TODO: this is migration data and could probably be removed someday
            try {
                oldImageCaptions = contentModule.content?.captions;
                if (oldImageCaptions instanceof Array) {
                    shownContentModule = {
                        ...contentModule,
                        content: null,
                        configuration: {
                            ...contentModule.configuration,
                            files: (contentModule.files || []).reduce(
                                (prev, file, i) => ({
                                    ...prev,
                                    [file.id]: {
                                        caption: oldImageCaptions[i] || '',
                                        sortKey: i * 10,
                                    },
                                }),
                                {}
                            ),
                        },
                    };
                }
            } catch {}
        } else if (
            !contentModule.configuration ||
            !contentModule.configuration.files
        ) {
            shownContentModule = {
                ...contentModule,
                configuration: {
                    ...contentModule.configuration,
                    files: (contentModule.files || []).reduce(
                        (prev, file, i) => ({
                            ...prev,
                            [file.id]: {
                                caption: oldImageCaptions[i] || '',
                                sortKey: i * 10,
                            },
                        }),
                        {}
                    ),
                },
            };
        }
        // TODO Migration Part /END

        return (
            <div
                className={styles.root}
                data-testid="ImageCollectionContentModule"
            >
                {imageStyle === ImageStyle.GALLERY && (
                    <Gallery
                        isEditModeEnabled={!!isEditModeEnabled}
                        contentModule={shownContentModule}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {imageStyle === ImageStyle.CAROUSEL && (
                    <Carousel
                        isEditModeEnabled={!!isEditModeEnabled}
                        contentModule={shownContentModule}
                        onUpdateModule={onUpdateModule}
                    />
                )}
            </div>
        );
    }
);
ImageCollection.displayName = 'ImageCollection';
