import React, { memo } from 'react';
import { ContentModuleModel, FileModel, FileModelType, FileConversion } from '../../../../model';
import { File } from 'util/model';
import { CardContent, Typography, Button, Grid, Divider } from '@material-ui/core';
import { FileSize } from 'util/FileSize';
import { useStyles } from './Download';
import { BackgroundImg } from 'react-cloudimage-responsive';
import { CloudDownload } from '@material-ui/icons';

export interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show = memo<ShowProps>(({ contentModule }) => {
    const styles = useStyles();

    const getConfiguration = (file: FileModel) => {
        if (contentModule.configuration && contentModule.configuration.files && contentModule.configuration.files[file.id]) {
            return {
                description: '',
                sortKey: 0,
                ...contentModule.configuration.files[file.id]
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

    const previewFile = (file: FileModel): FileModel | FileConversion => {
        return file;
    };

    return (
        <CardContent>
            {[...contentModule.files].sort((f1, f2) => getConfiguration(f1).sortKey - getConfiguration(f2).sortKey).map(file => (
                <div key={file.id} className={styles.downloadItemWrapper}>
                    <div className={styles.downloadWrapperHeader}>
                        <Grid
                            container
                            direction={'row'}
                            justify={'flex-start'}
                            alignItems={'stretch'}
                            spacing={1}
                            style={{ position: 'relative' }}
                        >
                            <Grid item xs={8} sm={3} md={3} style={{ alignSelf: 'center', }}>
                                <Button
                                    fullWidth
                                    variant={'outlined'}
                                    color={'secondary'}
                                    style={{ minWidth: 130, maxWidth: 160, }}
                                    component={'a'}
                                    href={File.getSameOriginUrl(file)}
                                    download={file.filename}
                                    target={'_blank'}
                                    startIcon={<CloudDownload />}>
                                    download
                                </Button>
                            </Grid>
                            {!contentModule.configuration?.hidePreviews && hasPreviewImage(file) && (
                                <Grid item xs={4} sm={2} md={1} style={{ position: 'relative' }}>
                                    <BackgroundImg
                                        style={{ width: '100%', height: '100%', borderRadius: 4, background: 'transparent 50% 50% / cover no-repeat' }}
                                        src={previewFile(file).remoteLocation}
                                        params="func=crop&gravity=auto"
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={7} md={8}>
                                <div>
                                    {getConfiguration(file).description && (
                                        <Typography className={styles.downloadDescription}>
                                            {getConfiguration(file).description}
                                        </Typography>
                                    )}
                                    <Typography className={styles.filename}>
                                        {file.filename}
                                    </Typography>
                                    <Typography className={styles.secondaryHeading}>
                                        {new FileSize(file.filesize).humanize()}
                                    </Typography>
                                </div>
                            </Grid>
                            <Divider className={styles.downloadItemDivider} />
                        </Grid>
                    </div>
                </div>
            ))}
        </CardContent>
    )
});
