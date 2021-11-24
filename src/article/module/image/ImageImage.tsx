import * as React from 'react';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { FileModelType, FileModel } from 'model';
import { ImageContent, ImageContentProps } from './ImageContent';
import { ImageCaption } from './ImageCaption';

import styles from './ImageImage.module.scss';

interface ImageImageProps extends Omit<ImageContentProps, 'onClick'> {
    isEditModeEnabled: boolean;
    file?: FileModel | null;
    caption: string;
    onUpdateFile(file: FileModel): void;
    onUpdateCaption(caption: string): void;
    onSelect?(e: React.MouseEvent<HTMLImageElement>): void;
}

export const ImageImage = React.memo<ImageImageProps>(
    ({
        isEditModeEnabled,
        file,
        caption,
        onUpdateFile,
        onUpdateCaption,
        onSelect,
        ...otherProps
    }) => {
        const imageContent = isEditModeEnabled ? (
            <SelectFileOverlay
                label={'Bild auswechseln'}
                fileFilter={(f) => f.fileType === FileModelType.Image}
                onSelectFile={onUpdateFile}
            >
                <ImageContent file={file} {...otherProps} />
            </SelectFileOverlay>
        ) : (
            <ImageContent onClick={onSelect} file={file} {...otherProps} />
        );
        return (
            <figure className={styles.root}>
                {imageContent}
                <ImageCaption
                    isEditModeEnabled={isEditModeEnabled}
                    value={caption}
                    onUpdate={onUpdateCaption}
                />
            </figure>
        );
    }
);
ImageImage.displayName = 'ImageImage';
