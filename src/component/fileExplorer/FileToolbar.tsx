import React, { memo, useContext } from 'react';
import { CloudUploadOutlined, CreateNewFolderOutlined, FileCopyOutlined, DeleteOutlineOutlined, HomeOutlined } from '@material-ui/icons';
import { makeStyles, Theme, createStyles, Tooltip, IconButton, Toolbar, Badge, CircularProgress, Zoom, Breadcrumbs, Link } from '@material-ui/core';
import { useUploads, useCreateUpload } from './context/UploadQueueContext';
import { DirectoryModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { File } from 'util/model';
import fileExplorerContext, { FileExplorerMode } from './context/FileExplorerContext';

const useStyles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        spacer: {
            flexGrow: 1
        },
        title: {
            overflow: 'auto',
            flex: '1 1 auto',
        },
        actions: {
            color: theme.palette.text.secondary,
            display: 'flex',
            flex: '0 0 auto'
        },
        uploadButton: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0
        },
        breadcrumbs: {
            '& [role=button]': {
                pointerEvents: 'none',
                cursor: 'inherit'
            }
        }
    }),
);

export const FileToolbar = memo(() => {
    const styles = useStyles();

    const [currentUser] = useCurrentUser();
    const uploads = useUploads();
    const createUpload = useCreateUpload();
    const [state, dispatch] = useContext(fileExplorerContext);

    const uploadLength = uploads.length;
    const uploadTotalProgress = uploads
        .filter(upload => !upload.error)
        .map(upload => upload.uploadProgress)
        .reduce(((prevProgress, currProgress) => prevProgress + currProgress), 0) / uploadLength;

    const showFileEditingButtons = state.mode === FileExplorerMode.ViewAndEdit && state.markedFiles.length > 0;

    return (
        <>
            <Toolbar>
                <div className={styles.title}>
                    <Breadcrumbs component={'div'} maxItems={7} itemsBeforeCollapse={2} itemsAfterCollapse={4} aria-label="breadcrumb" style={{ fontSize: '.85rem' }}>
                        {state.currentPath.length > 1 && (
                            <Link color="inherit" onClick={() => dispatch({ type: 'setPath', path: [{ id: null }] })}>
                                <HomeOutlined />
                            </Link>
                        )}
                        {state.currentPath.slice(1).map((pathDirectory, i, array) => {
                            const currentPathComponents = array.slice(0, i + 1);
                            const currentPathString = currentPathComponents.map(dir => dir.id === null ? '' : dir.name).join('/');
                            return (
                                <Link key={currentPathString} color={'inherit'} onClick={() => dispatch({ type: 'setPath', path: [{ id: null }, ...currentPathComponents] })}>
                                    {pathDirectory.id && pathDirectory.name}
                                </Link>
                            );
                        })}
                    </Breadcrumbs>
                </div>
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    <Zoom in={uploadLength > 0}>
                        <Tooltip title={`${uploadLength} Dateien werden hochgeladen`}>
                            <Badge
                                color={uploads.filter(u => u.error).length ? 'error' : 'primary'}
                                badgeContent={uploads.filter(u => u.error).length ? <span>!</span> : uploadLength}
                            >
                                <IconButton aria-label={`${uploadLength} Dateien werden hochgeladen`} onClick={() => dispatch({ type: 'showActiveUploads' })}>
                                    <CircularProgress
                                        size={20}
                                        variant={'static'}
                                        value={uploadTotalProgress}
                                    />
                                </IconButton>
                            </Badge>
                        </Tooltip>
                    </Zoom>
                    {File.canEditDirectory(state.currentPath.slice(-1)[0] as DirectoryModel, currentUser!) && (
                        <>
                            <Zoom in={showFileEditingButtons}>
                                <Tooltip title="Dateien verschieben">
                                    <IconButton aria-label="Dateien verschieben" onClick={() => dispatch({ type: 'showMoveFiles' })}>
                                        <FileCopyOutlined color={'secondary'} />
                                    </IconButton>
                                </Tooltip>
                            </Zoom>
                            <Zoom in={showFileEditingButtons}>
                                <Tooltip title="Dateien löschen">
                                    <IconButton aria-label="Dateien löschen" onClick={() => dispatch({ type: 'showDeleteFiles' })}>
                                        <DeleteOutlineOutlined color={'secondary'} />
                                    </IconButton>
                                </Tooltip>
                            </Zoom>
                            <Tooltip title="Ordner erstellen">
                                <IconButton aria-label="Ordner erstellen" onClick={() => dispatch({ type: 'showCreateNewFolder' })}>
                                    <CreateNewFolderOutlined color={'secondary'} />
                                </IconButton>
                            </Tooltip>
                            <Zoom in={state.currentPath.length > 1}>
                                <Tooltip title="Dateien hochladen">
                                    <IconButton aria-label="Dateien hochladen">
                                        <input
                                            multiple
                                            type={'file'}
                                            className={styles.uploadButton}
                                            onChange={e => {
                                                if (e.target.files) {
                                                    Array.from(e.target.files).forEach(file => createUpload(file, state.currentPath.slice(-1)[0] as DirectoryModel));
                                                }
                                            }}
                                        />
                                        <CloudUploadOutlined color={'secondary'} />
                                    </IconButton>
                                </Tooltip>
                            </Zoom>
                        </>
                    )}
                </div>
            </Toolbar>
        </>
    );
});