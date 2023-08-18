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
        // We should not need parseInt, but making sure it is really
        // a number is safer for not mismatching 1 and "1", for example
        const imageStyle: ImageStyle = parseInt(
            get(contentModule.configuration, 'imageStyle', ImageStyle.GALLERY)
        );

        return (
            <div
                className={styles.root}
                data-testid="ImageCollectionContentModule"
            >
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
