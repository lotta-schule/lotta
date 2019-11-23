import React, { memo } from 'react';
import { ContentModuleModel, FileModel } from '../../../../model';
import { CardContent, Typography, Button } from '@material-ui/core';
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
            {contentModule.files.sort((f1, f2) => getConfiguration(f1).sortKey - getConfiguration(f2).sortKey).map(file => (
                <div key={file.id} className={styles.downloadItemWrapper}>
                    <div className={styles.downloadWrapperHeader}>
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
                        <Button variant={'outlined'} color={'secondary'} component={'a'} href={file.remoteLocation} download={file.filename} target={'_blank'}>download</Button>
                    </div>
                </div>
            ))}
        </CardContent>
    )
});