import React, { memo } from 'react';
import { ContentModuleModel, FileModel } from '../../../../model';
import { File } from 'util/model';
import { CardContent, Typography, Button, Grid } from '@material-ui/core';
import { FileSize } from 'util/FileSize';
import { useStyles } from './Download';

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

    return (
        <CardContent>
            {[...contentModule.files].sort((f1, f2) => getConfiguration(f1).sortKey - getConfiguration(f2).sortKey).map(file => (
                <div key={file.id} className={styles.downloadItemWrapper}>
                    <div className={styles.downloadWrapperHeader}>
                        <Grid
                            container
                            direction={'row'}
                            justify={'flex-start'}
                            alignItems={'flex-start'}
                            spacing={1}>
                            <Grid item xs={12} sm={8} md={10}>
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
                            <Grid item xs={12} sm={4} md={2}>
                                <Button
                                    variant={'outlined'}
                                    color={'secondary'}
                                    component={'a'}
                                    href={File.getSameOriginUrl(file)}
                                    download={file.filename}
                                    target={'_blank'}>
                                    download
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            ))}
        </CardContent>
    )
});