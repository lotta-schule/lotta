import React, { FunctionComponent, memo, Fragment } from 'react';
import { CloudUploadOutlined, CreateNewFolderOutlined } from '@material-ui/icons';
import {
    makeStyles, Theme, createStyles, Typography, Tooltip, IconButton, Toolbar, Badge, CircularProgress, Link,
} from '@material-ui/core';
import { UploadModel } from 'model';

const useStyles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        spacer: {
            flex: '1 1 100%',
        },
        actions: {
            color: theme.palette.text.secondary,
            display: 'flex'
        },
        title: {
            flex: '0 0 auto',
        }
    }),
);

export interface FileToolbarProps {
    path: string;
    uploads: UploadModel[];
    onChangePath(path: string): void;
    onClickUploadButton(): void;
    onClickOpenActiveUploadsDialog(): void;
    onClickOpenCreateNewFolderDialog(): void;
}

export const FileToolbar: FunctionComponent<FileToolbarProps> = memo(({
    path,
    onChangePath,
    uploads,
    onClickUploadButton,
    onClickOpenActiveUploadsDialog,
    onClickOpenCreateNewFolderDialog
}) => {
    const styles = useStyles();

    const uploadLength = uploads.length;
    const uploadTotalProgress = uploads.map(upload => upload.uploadProgress)
        .reduce(((prevProgress, currProgress) => prevProgress + currProgress), 0) / uploadLength;

    const pathLinks = path.replace(/^\//, '').split('/').reduce(
        ((prevPathComps, currentPathComp) => {
            if (!currentPathComp) {
                return prevPathComps;
            }
            const lastPathComp = prevPathComps[prevPathComps.length - 1];
            return prevPathComps.concat([{
                path: lastPathComp.path + '/' + currentPathComp,
                name: currentPathComp
            }]);
        }),
        [{ path: '/', name: '/' }]
    );

    return (
        <>
            <Toolbar>
                <div className={styles.title}>
                    <Typography variant="h6">
                        {pathLinks.map((pathLink, i) => (
                            <Fragment key={pathLink.path}>
                                &nbsp;
                                <Link
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        onChangePath(pathLink.path)
                                    }}
                                >{pathLink.name}</Link>
                                {i !== 0 && <span>&nbsp;/&nbsp;</span>}
                            </Fragment>
                        ))}
                    </Typography>
                </div>
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    {uploadLength > 0 && (
                        <Tooltip title={`${uploadLength} Dateien werden hochgeladen`}>
                            <Badge color={'primary'} badgeContent={uploadLength}>
                                <IconButton aria-label={`${uploadLength} Dateien werden hochgeladen`} onClick={() => onClickOpenActiveUploadsDialog()}>
                                    <CircularProgress
                                        size={20}
                                        variant={'static'}
                                        value={uploadTotalProgress}
                                    />
                                </IconButton>
                            </Badge>
                        </Tooltip>
                    )}
                    <Tooltip title="Ordner erstellen">
                        <IconButton aria-label="Ordner erstellen" onClick={() => onClickOpenCreateNewFolderDialog()}>
                            <CreateNewFolderOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Dateien hochladen">
                        <IconButton aria-label="Dateien hochladen" onClick={() => onClickUploadButton()}>
                            <CloudUploadOutlined />
                        </IconButton>
                    </Tooltip>
                </div>
            </Toolbar>
        </>
    );
});