import * as React from 'react';
import {
    CloudUploadOutlined,
    CreateNewFolderOutlined,
    FileCopyOutlined,
    DeleteOutlineOutlined,
    HomeOutlined,
    Info,
    InfoOutlined,
} from '@material-ui/icons';
import {
    Tooltip,
    Toolbar,
    Badge,
    CircularProgress,
    Zoom,
    Breadcrumbs,
} from '@material-ui/core';
import { useUploads, useCreateUpload } from './context/UploadQueueContext';
import { DirectoryModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from 'util/useIsMobile';
import { File } from 'util/model';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';
import { Button } from 'shared/general/button/Button';

import styles from './FileToolbar.module.scss';

export const FileToolbar = React.memo(() => {
    const isMobile = useIsMobile();

    const currentUser = useCurrentUser();
    const uploads = useUploads();
    const createUpload = useCreateUpload();
    const [state, dispatch] = React.useContext(fileExplorerContext);

    const uploadLength = uploads.length;
    const uploadTotalProgress =
        uploads
            .filter((upload) => !upload.error)
            .map((upload) => upload.uploadProgress)
            .reduce(
                (prevProgress, currProgress) => prevProgress + currProgress,
                0
            ) / uploadLength;

    const showFileEditingButtons =
        state.mode === FileExplorerMode.ViewAndEdit &&
        state.markedFiles.length > 0;

    return (
        <>
            <Toolbar className={styles.toolbar}>
                <div
                    className={styles.title}
                    data-testid="FileExplorerToolbarPath"
                >
                    <Breadcrumbs
                        component={'div'}
                        maxItems={7}
                        itemsBeforeCollapse={2}
                        itemsAfterCollapse={4}
                        aria-label="breadcrumb"
                        style={{ fontSize: '.85rem' }}
                    >
                        {state.currentPath.length > 1 && (
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatch({
                                        type: 'setPath',
                                        path: [{ id: null }],
                                    });
                                }}
                            >
                                <HomeOutlined />
                            </a>
                        )}
                        {state.currentPath
                            .slice(1)
                            .map((pathDirectory, i, array) => {
                                const currentPathComponents = array.slice(
                                    0,
                                    i + 1
                                );
                                const currentPathString = currentPathComponents
                                    .map((dir) =>
                                        dir.id === null ? '' : dir.name
                                    )
                                    .join('/');
                                return (
                                    <a
                                        key={currentPathString}
                                        onClick={(e) => {
                                            dispatch({
                                                type: 'setPath',
                                                path: [
                                                    { id: null },
                                                    ...currentPathComponents,
                                                ],
                                            });
                                        }}
                                    >
                                        {pathDirectory.id && pathDirectory.name}
                                    </a>
                                );
                            })}
                    </Breadcrumbs>
                </div>
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    <Zoom in={uploadLength > 0}>
                        <Tooltip
                            title={`${uploadLength} Dateien werden hochgeladen`}
                        >
                            <Badge
                                color={
                                    uploads.filter((u) => u.error).length
                                        ? 'error'
                                        : 'primary'
                                }
                                badgeContent={
                                    uploads.filter((u) => u.error).length ? (
                                        <span>!</span>
                                    ) : (
                                        uploadLength
                                    )
                                }
                            >
                                <Button
                                    aria-label={`${uploadLength} Dateien werden hochgeladen`}
                                    onClick={() =>
                                        dispatch({ type: 'showActiveUploads' })
                                    }
                                    data-testid="FileExplorerToolbarCurrentUploadsButton"
                                >
                                    <CircularProgress
                                        size={20}
                                        variant={'determinate'}
                                        value={uploadTotalProgress}
                                    />
                                </Button>
                            </Badge>
                        </Tooltip>
                    </Zoom>
                    {File.canEditDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <>
                            <Zoom in={showFileEditingButtons}>
                                <Tooltip title="Dateien verschieben">
                                    <Button
                                        aria-label="Dateien verschieben"
                                        onClick={() =>
                                            dispatch({ type: 'showMoveFiles' })
                                        }
                                        data-testid="FileExplorerToolbarMoveFileButton"
                                        icon={
                                            <FileCopyOutlined
                                                color={'secondary'}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </Zoom>
                            <Zoom in={showFileEditingButtons}>
                                <Tooltip title="Dateien löschen">
                                    <Button
                                        aria-label="Dateien löschen"
                                        onClick={() =>
                                            dispatch({
                                                type: 'showDeleteFiles',
                                            })
                                        }
                                        data-testid="FileExplorerToolbarDeleteFileButton"
                                        icon={
                                            <DeleteOutlineOutlined
                                                color={'secondary'}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </Zoom>
                        </>
                    )}
                    {File.canCreateDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <Tooltip title="Ordner erstellen">
                            <Button
                                aria-label="Ordner erstellen"
                                onClick={() =>
                                    dispatch({ type: 'showCreateNewFolder' })
                                }
                                data-testid="FileExplorerToolbarCreateDirectoryButton"
                                icon={
                                    <CreateNewFolderOutlined
                                        color={'secondary'}
                                    />
                                }
                            />
                        </Tooltip>
                    )}
                    {File.canEditDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <Zoom in={state.currentPath.length > 1}>
                            <Tooltip title="Dateien hochladen">
                                <Button
                                    aria-label="Dateien hochladen"
                                    data-testid="FileExplorerToolbarNewUploadButton"
                                    onlyIcon
                                    icon={
                                        <CloudUploadOutlined
                                            color={'secondary'}
                                        />
                                    }
                                >
                                    <input
                                        multiple
                                        type={'file'}
                                        className={styles.uploadButton}
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                Array.from(
                                                    e.target.files
                                                ).forEach((file) =>
                                                    createUpload(
                                                        file,
                                                        state.currentPath.slice(
                                                            -1
                                                        )[0] as DirectoryModel
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                </Button>
                            </Tooltip>
                        </Zoom>
                    )}
                    {!isMobile && state.mode === FileExplorerMode.ViewAndEdit && (
                        <Zoom in={state.currentPath.length > 1}>
                            <Tooltip
                                title={`Info-Leiste für Dateien und Ordner ${
                                    state.detailSidebarEnabled
                                        ? 'ausblenden'
                                        : 'einblenden'
                                }`}
                            >
                                <Button
                                    data-testid="FileExplorerDetailViewButton"
                                    aria-label={`Info-Leiste für Dateien und Ordner ${
                                        state.detailSidebarEnabled
                                            ? 'ausblenden'
                                            : 'einblenden'
                                    }`}
                                    onClick={() =>
                                        dispatch({
                                            type: 'toggleDetailSidebarEnabled',
                                        })
                                    }
                                    icon={
                                        state.detailSidebarEnabled ? (
                                            <Info
                                                color={'secondary'}
                                                data-testid="enable-detail-sidebar-icon"
                                            />
                                        ) : (
                                            <InfoOutlined
                                                color={'secondary'}
                                                data-testid="disable-detail-sidebar-icon"
                                            />
                                        )
                                    }
                                />
                            </Tooltip>
                        </Zoom>
                    )}
                </div>
            </Toolbar>
        </>
    );
});
FileToolbar.displayName = 'FileToolbar';
