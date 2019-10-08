import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from 'model';
import { ImageImage } from '../ImageImage';

export interface SingleProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Single: FunctionComponent<SingleProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    let imageCaption;
    try {
        const parsedText = JSON.parse(contentModule.text!);
        imageCaption = parsedText[0];
    } catch {
        imageCaption = contentModule.text;
    }
    return (
        <ImageImage
            isEditModeEnabled={isEditModeEnabled}
            caption={imageCaption}
            file={contentModule.files ? contentModule.files[0] : null}
            onUpdateFile={newFile => onUpdateModule({ ...contentModule, files: [newFile] })}
            onUpdateCaption={caption => onUpdateModule({ ...contentModule, text: JSON.stringify([caption]) })}
        />
    );
});