import * as React from 'react';
import { ContentModuleModel, FileModelType } from 'model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { AudioAudio } from './AudioAudio';

import styles from './AudioAudio.module.scss';

interface EditProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
    onUpdateModule(
        contentModule: ContentModuleModel<{ captions: string[] }>
    ): void;
}

export const Edit = React.memo<EditProps>(
    ({ contentModule, onUpdateModule }) => {
        const captions: string[] = contentModule.content?.captions ?? [];
        return (
            <figure>
                <SelectFileOverlay
                    label={'Audiodatei auswechseln'}
                    fileFilter={(f) => f.fileType === FileModelType.Audio}
                    onSelectFile={(file) =>
                        onUpdateModule({
                            ...contentModule,
                            files: file ? [file] : [],
                        })
                    }
                >
                    <AudioAudio contentModule={contentModule} />
                </SelectFileOverlay>
                <figcaption>
                    <input
                        contentEditable
                        defaultValue={captions[0]}
                        className={styles.figcaption}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            onUpdateModule({
                                ...contentModule,
                                content: {
                                    captions: [e.currentTarget.value],
                                },
                            });
                        }}
                    />
                </figcaption>
            </figure>
        );
    }
);
Edit.displayName = 'AudioEdit';
