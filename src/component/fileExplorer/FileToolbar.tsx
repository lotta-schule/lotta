import React, { FunctionComponent, memo, Fragment } from 'react';
import { CloudUploadOutlined, CreateNewFolderOutlined, FileCopyOutlined, DeleteOutlineOutlined, FolderSharedOutlined, PublicOutlined } from '@material-ui/icons';
import {
    makeStyles, Theme, createStyles, Typography, Tooltip, IconButton, Toolbar, Badge, CircularProgress, Link,
} from '@material-ui/core';
import { UploadModel } from 'model';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';

const useStyles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        spacer: {
            flex: '1 1 100%',
        },
        actions: {
            color: theme.palette.text.secondary,
            display: 'flex'
        },
        publicToggle: {
            marginLeft: -theme.spacing(2),
            marginRight: theme.spacing(2)
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
    showFileCreateButtons: boolean;
    showFileEditingButtons: boolean;
    publicModeAvailable: boolean;
    publicModeSelected: boolean;
    onSetIsPublicModeSelected(value: boolean): void;
    onChangePath(path: string): void;
    onSelectFilesToUpload(files: File[]): void;
    onClickOpenActiveUploadsDialog(): void;
    onClickOpenCreateNewFolderDialog(): void;
    onClickOpenMoveFilesDialog(): void;
    onClickDeleteFilesDialog(): void;
}

export const FileToolbar: FunctionComponent<FileToolbarProps> = memo(({
    path,
    onChangePath,
    uploads,
    showFileCreateButtons,
    showFileEditingButtons,
    publicModeAvailable,
    publicModeSelected,
    onSetIsPublicModeSelected,
    onSelectFilesToUpload,
    onClickOpenActiveUploadsDialog,
    onClickOpenCreateNewFolderDialog,
    onClickOpenMoveFilesDialog,
    onClickDeleteFilesDialog
}) => {
    const styles = useStyles();

    const uploadLength = uploads.length;
    const uploadTotalProgress = uploads.map(upload => upload.uploadProgress)
        .reduce(((prevProgress, currProgress) => prevProgress + currProgress), 0) / uploadLength;
    const rootDescription = publicModeSelected ? 'Schulweite Medien' : 'Meine Medien';

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
        [{ path: '/', name: `${rootDescription} /` }]
    );

    return (
        <>
            <Toolbar>
                {publicModeAvailable && (
                    <div className={styles.publicToggle}>
                        <ToggleButtonGroup
                            exclusive
                            size={'small'}
                            value={publicModeSelected}
                            onChange={(_e, value) => onSetIsPublicModeSelected(value)}
                            aria-label={'Ansicht zwischen meinen Dateien und schulweiten Dateien wechseln'}
                        >
                            <ToggleButton value={false}>
                                <Tooltip title={'Meine Medien'}>
                                    <FolderSharedOutlined />
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value={true}>
                                <Tooltip title={'schulweite Medien'}>
                                    <PublicOutlined />
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                )}
                <div className={styles.title}>
                    <Typography variant="subtitle1">
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
                    {showFileCreateButtons && (
                        <>
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
                        </>
                    )}
                    {showFileEditingButtons && (
                        <>
                            <Tooltip title="Dateien verschieben">
                                <IconButton aria-label="Dateien verschieben" onClick={() => onClickOpenMoveFilesDialog()}>
                                    <FileCopyOutlined color={'secondary'} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Dateien löschen">
                                <IconButton aria-label="Dateien löschen" onClick={() => onClickDeleteFilesDialog()}>
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