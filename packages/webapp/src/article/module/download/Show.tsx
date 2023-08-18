import * as React from 'react';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';
import { ContentModuleModel, FileModel, FileModelType } from 'model';
import { useServerData } from 'shared/ServerDataContext';
import { File } from 'util/model';
import { FileSize } from 'util/FileSize';
import { Icon } from 'shared/Icon';
import { ResponsiveImage } from 'util/image/ResponsiveImage';

import styles from './Download.module.scss';

export interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
    const { baseUrl } = useServerData();
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

    const hasPreviewImage = (file: FileModel) => {
        if (file.fileType === FileModelType.Image) {
            return true;
        }
        return false;
    };

    return (
        <div className={styles.root}>
            {[...contentModule.files]
                .sort(
                    (f1, f2) =>
                        getConfiguration(f1).sortKey -
                        getConfiguration(f2).sortKey
                )
                .map((file) => (
                    <div key={file.id} className={styles.downloadItemWrapper}>
                        <section className={styles.buttonWrapper}>
                            <Button
                                href={File.getFileRemoteLocation(
                                    baseUrl,
                                    file,
                                    'download'
                                )}
                                target={'_blank'}
                                icon={
                                    <Icon icon={faCloudArrowDown} size={'lg'} />
                                }
                                role={'link'}
                            >
                                download
                            </Button>
                        </section>
                        {!contentModule.configuration?.hidePreviews &&
                            hasPreviewImage(file) && (
                                <div className={styles.previewWrapper}>
                                    <ResponsiveImage
                                        alt={'Bildvorschau'}
                                        width={400}
                                        resize={'inside'}
                                        sizes={'150px'}
                                        style={{
                                            width: '30%',
                                            borderRadius: 4,
                                        }}
                                        src={File.getFileRemoteLocation(
                                            baseUrl,
                                            file
                                        )}
                                    />
                                </div>
                            )}
                        <div>
                            {getConfiguration(file).description && (
                                <div className={styles.downloadDescription}>
                                    {getConfiguration(file).description}
                                </div>
                            )}
                            <div className={styles.filename}>
                                {file.filename}
                            </div>
                            <div className={styles.secondaryHeading}>
                                {new FileSize(file.filesize).humanize()}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
});
Show.displayName = 'DownloadShow';
