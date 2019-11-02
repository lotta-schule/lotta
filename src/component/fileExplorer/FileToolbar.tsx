import React, { FunctionComponent, memo, Fragment } from 'react';
import { CloudUploadOutlined, CreateNewFolderOutlined, FileCopyOutlined, DeleteOutlineOutlined } from '@material-ui/icons';
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
        },
        uploadButton: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0
        }
    }),
);

export interface FileToolbarProps {
    path: string;
    uploads: UploadModel[];
    showFileEditingButtons: boolean;
    onChangePath(path: string): void;
    onSelectFilesToUpload(files: File[]): void;
    onClickOpenActiveUploadsDialog(): void;
    onClickOpenCreateNewFolderDialog(): void;
    onClickOpenMoveFilesDialog(): void;
}

export const FileToolbar: FunctionComponent<FileToolbarProps> = memo(({
    path,
    onChangePath,
    uploads,
    showFileEditingButtons,
    onSelectFilesToUpload,
    onClickOpenActiveUploadsDialog,
    onClickOpenCreateNewFolderDialog,
    onClickOpenMoveFilesDialog
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
                path: lastPathComp.path === '/' ? `/${currentPathComp}` : `${lastPathComp.path}/${currentPathComp}`,
                name: currentPathComp
            }]);
        }),
        [{ path: '/', name: 'Medien /' }]
    );

    return (
        <>
            <Toolbar>
                <div className={styles.title}>
                    <Typography variant="button">
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
                            <CreateNewFolderOutlined color={'secondary'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Dateien hochladen">
                        <IconButton aria-label="Dateien hochladen">
                            <input
                                multiple
                                type={'file'}
                                className={styles.uploadButton}
                                onChange={e => {
                                    if (e.target.files) {
                                        onSelectFilesToUpload(Array.from(e.target.files))
                                    }
                                }}
                            />
                            <CloudUploadOutlined color={'secondary'} />
                        </IconButton>
                    </Tooltip>
                    {showFileEditingButtons && (
                        <>
                            <Tooltip title="Dateien verschieben">
                                <IconButton aria-label="Dateien verschieben" onClick={() => onClickOpenMoveFilesDialog()}>
                                    <FileCopyOutlined color={'secondary'} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Dateien löschen">
                                <IconButton aria-label="Dateien löschen" onClick={() => onClickOpenCreateNewFolderDialog()}>
                                    <DeleteOutlineOutlined color={'secondary'} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </div>
            </Toolbar>
        </>
    );
});