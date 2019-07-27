import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from 'model';
import { ImageImage } from '../ImageImage';
import { Grid } from '@material-ui/core';
import { SelectFileButton } from 'component/edit/SelectFileButton';

export interface GaleryProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Galery: FunctionComponent<GaleryProps> = memo(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    let imageCaptions: (string | null)[];
    try {
        imageCaptions = JSON.parse(contentModule.text!);
    } catch {
        imageCaptions = [contentModule.text || null];
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
                        />
                    </Grid>
                ))}
            </Grid>
            {isEditModeEnabled && <SelectFileButton label={'Bild hinzufügen'} onSelectFile={f => onUpdateModule({ ...contentModule, files: contentModule.files.concat(f) })} />}
        </>
    );
});