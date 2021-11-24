import * as React from 'react';
import { ContentModuleModel, FileModel, FileModelType } from 'model';
import { File } from 'util/model';
import { CardContent, Grid } from '@material-ui/core';
import { FileSize } from 'util/FileSize';
import { BackgroundImg } from 'react-cloudimage-responsive';
import { CloudDownload } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { Divider } from 'shared/general/divider/Divider';
import { useServerData } from 'shared/ServerDataContext';

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
        <CardContent>
            {[...contentModule.files]
                .sort(
                    (f1, f2) =>
                        getConfiguration(f1).sortKey -
                        getConfiguration(f2).sortKey
                )
                .map((file) => (
                    <div key={file.id} className={styles.downloadItemWrapper}>
                        <div className={styles.downloadWrapperHeader}>
                            <Grid
                                container
                                direction={'row'}
                                justifyContent={'flex-start'}
                                alignItems={'stretch'}
                                spacing={1}
                                style={{ position: 'relative' }}
                            >
                                <Grid
                                    item
                                    xs={8}
                                    sm={3}
                                    md={3}
                                    style={{ alignSelf: 'center' }}
                                >
                                    <Button
                                        fullWidth
                                        style={{
                                            minWidth: 130,
                                            maxWidth: 160,
                                        }}
                                        href={File.getFileRemoteLocation(
                                            baseUrl,
                                            file,
                                            'download'
                                        )}
                                        target={'_blank'}
                                        icon={<CloudDownload />}
                                        role={'link'}
                                    >
                                        download
                                    </Button>
                                </Grid>
                                {!contentModule.configuration?.hidePreviews &&
                                    hasPreviewImage(file) && (
                                        <Grid
                                            item
                                            xs={4}
                                            sm={2}
                                            md={1}
                                            style={{ position: 'relative' }}
                                        >
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
                                        </Grid>
                                    )}
                                <Grid item xs={12} sm={7} md={8}>
                                    <div>
                                        {getConfiguration(file).description && (
                                            <div
                                                className={
                                                    styles.downloadDescription
                                                }
                                            >
                                                {
                                                    getConfiguration(file)
                                                        .description
                                                }
                                            </div>
                                        )}
                                        <div className={styles.filename}>
                                            {file.filename}
                                        </div>
                                        <div
                                            className={styles.secondaryHeading}
                                        >
                                            {new FileSize(
                                                file.filesize
                                            ).humanize()}
                                        </div>
                                    </div>
                                </Grid>
                                <Divider
                                    className={styles.downloadItemDivider}
                                />
                            </Grid>
                        </div>
                    </div>
                ))}
        </CardContent>
    );
});
Show.displayName = 'DownloadShow';
