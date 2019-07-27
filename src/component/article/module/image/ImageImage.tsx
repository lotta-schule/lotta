import React, { FunctionComponent, memo } from 'react';
import { FileModelType, FileModel } from '../../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { ImageContent } from './ImageContent';
import { ImageCaption } from './ImageCaption';

interface ImageImageProps {
    isEditModeEnabled: boolean;
    file?: FileModel | null;
    caption: string;
    onUpdateFile(file: FileModel): void;
    onUpdateCaption(caption: string): void;
}

export const ImageImage: FunctionComponent<ImageImageProps> = memo(({ isEditModeEnabled, file, caption, onUpdateFile, onUpdateCaption }) => {
    return (
        <figure>
            {isEditModeEnabled ?
                <SelectFileOverlay
                    label={'Bild auswechseln'}
                    fileFilter={f => f.fileType === FileModelType.Image}
                    onSelectFile={onUpdateFile}
                >
                    <ImageContent file={file} />
                </SelectFileOverlay> :
                <ImageContent file={file} />}
            <ImageCaption isEditModeEnabled={isEditModeEnabled} value={caption} onUpdate={onUpdateCaption} />
        </figure>
    );
});