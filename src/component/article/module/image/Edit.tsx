import React, { FunctionComponent, memo, FormEvent } from 'react';
import { ContentModuleModel, FileModelType } from '../../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { ImageImage } from './ImageImage';
import { Typography, makeStyles, Theme } from '@material-ui/core';

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

const useStyles = makeStyles((theme: Theme) => ({
    figcaption: {
        border: `1px solid ${theme.palette.secondary.main}`,
        width: '100%'
    }
}));

export const Edit: FunctionComponent<EditProps> = memo(({ contentModule, onUpdateModule }) => {
    const styles = useStyles();
    let captions: string[];
    try {
        captions = JSON.parse(contentModule.text || '[]');
    } catch (e) {
        captions = [];
    }
    return (
        <figure>
            <SelectFileOverlay
                label={'Bild auswechseln'}
                fileFilter={f => f.fileType === FileModelType.Image}
                onSelectFile={file => onUpdateModule({ ...contentModule, files: [file] })}
            >
                <ImageImage contentModule={contentModule} />
            </SelectFileOverlay>
            <figcaption>
                <Typography
                    variant={'subtitle2'}
                    component={'input'}
                    contentEditable={true}
                    defaultValue={captions[0]}
                    className={styles.figcaption}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                        onUpdateModule({
                            ...contentModule,
                            text: JSON.stringify([(e.target as HTMLInputElement).value])
                        });
                    }}
                />
            </figcaption>
        </figure>
    );
});