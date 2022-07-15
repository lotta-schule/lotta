import * as React from 'react';
import {
    CloudUploadOutlined,
    CreateNewFolderOutlined,
    FileCopyOutlined,
    DeleteOutlineOutlined,
    Info,
    InfoOutlined,
} from '@material-ui/icons';
import {
    Badge,
    Button,
    CircularProgress,
    Tooltip,
    Toolbar,
    Collapse,
} from '@lotta-schule/hubert';
import { useUploads, useCreateUpload } from './context/UploadQueueContext';
import { DirectoryModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from 'util/useIsMobile';
import { File } from 'util/model';
import { PathViewer } from './PathViewer';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';

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
                    <PathViewer
                        path={state.currentPath}
                        onChange={(path) => dispatch({ type: 'setPath', path })}
                    />
                </div>
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    <Collapse visible={uploadLength > 0}>
                        <Tooltip
                            label={`${uploadLength} Dateien werden hochgeladen`}
                        >
                            <Button
                                aria-label={`${uploadLength} Dateien werden hochgeladen`}
                                onClick={() =>
                                    dispatch({ type: 'showActiveUploads' })
                                }
                                data-testid="FileExplorerToolbarCurrentUploadsButton"
                            >
                                <CircularProgress
                                    aria-label={'Dateien werden hochgeladen.'}
                                    size={20}
                                    value={uploadTotalProgress}
                                />
                                {}
                                <Badge
                                    value={
                                        uploads.filter((u) => u.error).length
                                            ? '!'
                                            : uploadLength
                                    }
                                />
                            </Button>
                        </Tooltip>
                    </Collapse>
                    {File.canEditDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <>
                            <Collapse visible={showFileEditingButtons}>
                                <Tooltip label="Dateien verschieben">
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
                            </Collapse>
                            <Collapse visible={showFileEditingButtons}>
                                <Tooltip label="Dateien löschen">
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
                            </Collapse>
                        </>
                    )}
                    {File.canCreateDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <Tooltip label="Ordner erstellen">
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
                        <Collapse visible={state.currentPath.length > 1}>
                            <Tooltip label="Dateien hochladen">
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
                        </Collapse>
                    )}
                    {!isMobile && state.mode === FileExplorerMode.ViewAndEdit && (
                        <Collapse visible={state.currentPath.length > 1}>
                            <Tooltip
                                label={`Info-Leiste für Dateien und Ordner ${
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
                        </Collapse>
                    )}
                </div>
            </Toolbar>
        </>
    );
});
FileToolbar.displayName = 'FileToolbar';
