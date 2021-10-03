import * as React from 'react';
import { ContentModuleModel, FileModelType } from 'model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { VideoVideo } from './VideoVideo';

import styles from './Video.module.scss';

interface EditProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
    onUpdateModule(
        contentModule: ContentModuleModel<{ captions: string[] }>
    ): void;
}

export const Edit = React.memo<EditProps>(
    ({ contentModule, onUpdateModule }) => {
        const captions: string[] =
            contentModule.content?.captions ?? ([] as string[]);
        return (
            <figure className={styles.edit}>
                <SelectFileOverlay
                    label={'Video auswechseln'}
                    fileFilter={(f) => f.fileType === FileModelType.Video}
                    onSelectFile={(file) =>
                        onUpdateModule({
                            ...contentModule,
                            files: file ? [file] : [],
                        })
                    }
                >
                    <VideoVideo contentModule={contentModule} />
                </SelectFileOverlay>
                <figcaption>
                    <input
                        contentEditable={true}
                        defaultValue={captions[0]}
                        className={styles.figcaption}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            onUpdateModule({
                                ...contentModule,
                                content: {
                                    captions: [
                                        (e.target as HTMLInputElement).value,
                                    ],
                                },
                            });
                        }}
                    />
                </figcaption>
            </figure>
        );
    }
);
Edit.displayName = 'VideoEdit';
