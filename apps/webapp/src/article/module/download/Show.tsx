import * as React from 'react';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Button, FileSize } from '@lotta-schule/hubert';
import { ContentModuleModel, FileModel } from 'model';
import { File } from 'util/model';
import { Icon } from 'shared/Icon';
import { ResponsiveImage } from 'util/image/ResponsiveImage';

import styles from './Download.module.scss';

export interface ShowProps {
  contentModule: ContentModuleModel;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
  const getConfiguration = (file: FileModel) => {
    if (
      contentModule.configuration &&
      contentModule.configuration.files &&
      contentModule.configuration.files[file.id]
    ) {
      return {
        description: '',
        sortKey: 0,
        ...contentModule.configuration.files[file.id],
      };
    } else {
      return {
        description: '',
        sortKey: 0,
      };
    }
  };

  const hasPreviewImage = React.useCallback((file: FileModel) => {
    return file.formats.some((f) => f.name.startsWith('preview'));
  }, []);

  return (
    <div className={styles.root}>
      {[...contentModule.files]
        .sort(
          (f1, f2) =>
            getConfiguration(f1).sortKey - getConfiguration(f2).sortKey
        )
        .map((file) => (
          <div key={file.id} className={styles.downloadItemWrapper}>
            <section className={styles.buttonWrapper}>
              <Button
                href={File.getRemoteUrl(file, 'original')}
                target={'_blank'}
                icon={<Icon icon={faCloudArrowDown} size={'lg'} />}
                role={'link'}
                download
              >
                download
              </Button>
            </section>
            {!contentModule.configuration?.hidePreviews &&
              hasPreviewImage(file) && (
                <div className={styles.previewWrapper}>
                  <ResponsiveImage
                    alt={'Bildvorschau'}
                    format="preview"
                    style={{
                      width: '30%',
                      borderRadius: 4,
                    }}
                    file={file}
                  />
                </div>
              )}
            <div>
              {getConfiguration(file).description && (
                <div className={styles.downloadDescription}>
                  {getConfiguration(file).description}
                </div>
              )}
              <div className={styles.filename}>{file.filename}</div>
              <div className={styles.secondaryHeading}>
                {new FileSize(file.filesize || 0).humanize()}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
});
Show.displayName = 'DownloadShow';
