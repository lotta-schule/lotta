import React, { memo, MouseEvent } from 'react';
import { FileModelType, FileModel } from '../../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { ImageContent, ImageContentProps } from './ImageContent';
import { ImageCaption } from './ImageCaption';
import { makeStyles, Theme } from '@material-ui/core';

interface ImageImageProps extends Omit<ImageContentProps, 'onClick'> {
    isEditModeEnabled: boolean;
    file?: FileModel | null;
    caption: string;
    onUpdateFile(file: FileModel): void;
    onUpdateCaption(caption: string): void;
    onSelect?(e: MouseEvent<HTMLImageElement>): void;
}

const useStyles = makeStyles<Theme>(theme => ({
    image: {
        margin: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        [theme.breakpoints.down('xs')]: {
            padding: 0,
        }
    }
}));

export const ImageImage = memo<ImageImageProps>(({ isEditModeEnabled, file, caption, onUpdateFile, onUpdateCaption, onSelect, ...otherProps }) => {
    const imageContent = isEditModeEnabled ?
        (
            <SelectFileOverlay
                label={'Bild auswechseln'}
                fileFilter={f => f.fileType === FileModelType.Image}
                onSelectFile={onUpdateFile}
            >
                <ImageContent file={file} {...otherProps} />
            </SelectFileOverlay>
        ) :
        (
            <ImageContent onClick={onSelect} file={file} {...otherProps} />
        );
    const styles = useStyles();
    return (
        <figure className={styles.image}>
            {imageContent}
            <ImageCaption isEditModeEnabled={isEditModeEnabled} value={caption} onUpdate={onUpdateCaption} />
        </figure>
    );
});
