import * as React from 'react';
import { ContentModuleModel } from 'model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { VideoVideo } from './VideoVideo';
import { useRequestConversion } from '../useRequestConversion';
import { ConversionProgress } from '../ConversionProgress';

import styles from './Video.module.scss';

interface EditProps {
  contentModule: ContentModuleModel<{ captions: string[] }>;
  onUpdateModule(
    contentModule: ContentModuleModel<{ captions: string[] }>
  ): void;
}

export const Edit = React.memo(
  ({ contentModule, onUpdateModule }: EditProps) => {
    const captions: string[] =
      contentModule.content?.captions ?? ([] as string[]);
    const requestFileConversion = useRequestConversion(
      'videoplay',
      contentModule.files?.[0]
    );
    return (
      <figure className={styles.edit}>
        <SelectFileOverlay
          label={'Video wechseln'}
          fileFilter={(f) => f.fileType === 'VIDEO'}
          onSelectFile={(file) => {
            onUpdateModule({
              ...contentModule,
              files: file ? [file] : [],
            });
            if (file) {
              requestFileConversion(file);
            }
          }}
        >
          <VideoVideo contentModule={contentModule} />
        </SelectFileOverlay>
        <figcaption>
          <input
            contentEditable={true}
            defaultValue={captions[0]}
            className={styles.figcaption}
            placeholder={'Videobeschreibung'}
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
        <ConversionProgress
          key={contentModule.files?.[0]?.id}
          fileId={contentModule.files?.[0]?.id}
          category={'videoplay'}
        />
      </figure>
    );
  }
);
Edit.displayName = 'VideoEdit';
