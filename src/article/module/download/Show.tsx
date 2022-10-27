import * as React from 'react';
import { ContentModuleModel, FileModel, FileModelType } from 'model';
import { BackgroundImg } from 'react-cloudimage-responsive';

import { Button } from '@lotta-schule/hubert';
import { useServerData } from 'shared/ServerDataContext';
import { File } from 'util/model';
import { FileSize } from 'util/FileSize';

import styles from './Download.module.scss';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

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
                                    <BackgroundImg
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 4,
                                            background:
                                                'transparent 50% 50% / cover no-repeat',
                                        }}
                                        src={File.getFileRemoteLocation(
                                            baseUrl,
                                            file
                                        )}
                                        params="func=crop&gravity=auto"
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
