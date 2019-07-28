import React, { FunctionComponent, memo, useState } from 'react';
import { ContentModuleModel, FileModel } from 'model';
import { ImageImage } from '../ImageImage';
import { Grid } from '@material-ui/core';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { ImageOverlay } from '../imageOverlay/ImageOverlay';

export interface GaleryProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Galery: FunctionComponent<GaleryProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    const [selectedFile, setSelectedFile] = useState<FileModel | null>(null);
    let imageCaptions: (string | null)[] = [];
    try {
        if (!contentModule.text) {
            throw new Error('No Text');
        }
        imageCaptions = JSON.parse(contentModule.text);
    } catch {
        imageCaptions = contentModule.text ? [contentModule.text] : [];
    }
    return (
        <>
            <Grid container>
                {contentModule.files.map((file, index) => (
                    <Grid item xs={6} lg={4} xl={3}>
                        <ImageImage
                            isEditModeEnabled={isEditModeEnabled}
                            file={file}
                            caption={imageCaptions[index] || ''}
                            onUpdateFile={newFile => onUpdateModule({
                                ...contentModule,
                                files: contentModule.files.map((f, i) => i === index ? newFile : f)
                            })}
                            onUpdateCaption={newFile => onUpdateModule({
                                ...contentModule,
                                text: JSON.stringify(imageCaptions.map((f, i) => i === index ? newFile : f))
                            })}
                            onSelect={() => setSelectedFile(file)}
                        />
                    </Grid>
                ))}
            </Grid>
            {isEditModeEnabled && <SelectFileButton label={'Bild hinzufügen'} onSelectFile={f => onUpdateModule({ ...contentModule, files: contentModule.files.concat(f) })} />}
            {!isEditModeEnabled && (
                <ImageOverlay selectedFile={selectedFile} onClose={() => setSelectedFile(null)} />
            )}
        </>
    );
});