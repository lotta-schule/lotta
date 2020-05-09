import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from 'model';
import { ImageImage } from './ImageImage';

export interface ImageProps {
    contentModule: ContentModuleModel<{ caption: string }>;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel<{ caption: string }>): void;
}

export const Image: FunctionComponent<ImageProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    let imageCaption = contentModule.content?.caption;
    return (
        <ImageImage
            isEditModeEnabled={isEditModeEnabled || false}
            caption={imageCaption ?? ''}
            file={contentModule.files ? contentModule.files[0] : null}
            onUpdateFile={newFile => onUpdateModule({ ...contentModule, files: [newFile] })}
            onUpdateCaption={caption => onUpdateModule({ ...contentModule, content: { caption: caption } })}
        />
    );
});
