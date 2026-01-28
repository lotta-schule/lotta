import * as React from 'react';
import { ContentModuleModel } from 'model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { AudioAudio } from './AudioAudio';
import { useRequestConversion } from '../useRequestConversion';
import { ConversionProgress } from '../ConversionProgress';

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
    const requestFileConversion = useRequestConversion(
      'audioplay',
      contentModule.files?.[0]
    );
    return (
      <figure>
        <SelectFileOverlay
          label={'Audiodatei wechseln'}
          style={{ width: '100%' }}
          fileFilter={(f) => f.fileType === 'AUDIO'}
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
        <ConversionProgress
          key={contentModule.files?.[0]?.id}
          fileId={contentModule.files?.[0]?.id}
          category={'audioplay'}
        />
      </figure>
    );
  }
);
Edit.displayName = 'AudioEdit';
