import * as React from 'react';
import { CardContent } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import { ImageImage } from './ImageImage';

export interface ImageProps {
    contentModule: ContentModuleModel<{ caption: string }>;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (
        contentModule: ContentModuleModel<{ caption: string }>
    ) => void;
}

export const Image = React.memo<ImageProps>(
    ({ contentModule, isEditModeEnabled, onUpdateModule }) => {
        const imageCaption = contentModule.content?.caption;
        return (
            <CardContent data-testid="ImageContentModule">
                <ImageImage
                    isEditModeEnabled={!!isEditModeEnabled}
                    caption={imageCaption ?? ''}
                    file={contentModule.files ? contentModule.files[0] : null}
                    onUpdateFile={(newFile) =>
                        onUpdateModule?.({ ...contentModule, files: [newFile] })
                    }
                    onUpdateCaption={(caption) =>
                        onUpdateModule?.({
                            ...contentModule,
                            content: { caption: caption },
                        })
                    }
                />
            </CardContent>
        );
    }
);
Image.displayName = 'Image';
