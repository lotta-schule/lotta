import React, { FunctionComponent, memo, MouseEvent } from 'react';
import { FileModelType, FileModel } from '../../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { ImageContent, ImageContentProps } from './ImageContent';
import { ImageCaption } from './ImageCaption';

interface ImageImageProps extends Omit<ImageContentProps, 'onClick'> {
    isEditModeEnabled: boolean;
    file?: FileModel | null;
    caption: string;
    onUpdateFile(file: FileModel): void;
    onUpdateCaption(caption: string): void;
    onSelect?(e: MouseEvent<HTMLImageElement>): void;
}

export const ImageImage: FunctionComponent<ImageImageProps> = memo(({ isEditModeEnabled, file, caption, onUpdateFile, onUpdateCaption, onSelect, ...otherProps }) => {
    return (
        <figure style={{ marginLeft: 0, marginRight: 0, }}>
            {isEditModeEnabled ?
                <>
                    <SelectFileOverlay
                        label={'Bild auswechseln'}
                        fileFilter={f => f.fileType === FileModelType.Image}
                        onSelectFile={onUpdateFile}
                    >
                        <ImageContent file={file} {...otherProps} />
                    </SelectFileOverlay>
                    <ImageCaption isEditModeEnabled={isEditModeEnabled} value={caption} onUpdate={onUpdateCaption} />
                </> :
                <ImageContent file={file} onClick={onSelect} {...otherProps} />
            }
        </figure>
    );
});