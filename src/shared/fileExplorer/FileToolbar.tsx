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
} from '@lotta-schule/hubert';
import { motion } from 'framer-motion';
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

const AnimatedButton = motion(Button);

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
                    <Tooltip
                        label={`${uploadLength} Dateien werden hochgeladen`}
                    >
                        <AnimatedButton
                            aria-label={`${uploadLength} Dateien werden hochgeladen`}
                            onClick={() =>
                                dispatch({ type: 'showActiveUploads' })
                            }
                            data-testid="FileExplorerToolbarCurrentUploadsButton"
                            animate={uploadLength > 0 ? 'visible' : 'hidden'}
                            variants={{
                                visible: { opacity: 1, scale: 1 },
                                hidden: { opacity: 0, scale: 0 },
                            }}
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
                        </AnimatedButton>
                    </Tooltip>
                    {File.canEditDirectory(
                        state.currentPath.slice(-1)[0] as DirectoryModel,
                        currentUser!
                    ) && (
                        <>
                            <Tooltip label="Dateien verschieben">
                                <AnimatedButton
                                    aria-label="Dateien verschieben"
                                    onClick={() =>
                                        dispatch({ type: 'showMoveFiles' })
                                    }
                                    data-testid="FileExplorerToolbarMoveFileButton"
                                    icon={
                                        <FileCopyOutlined color={'secondary'} />
                                    }
                                    animate={
                                        showFileEditingButtons
                                            ? 'visible'
                                            : 'hidden'
                                    }
                                    variants={{
                                        visible: { opacity: 1, scale: 1 },
                                        hidden: { opacity: 0, scale: 0 },
                                    }}
                                />
                            </Tooltip>
                            <Tooltip label="Dateien löschen">
                                <AnimatedButton
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
                                    animate={
                                        showFileEditingButtons
                                            ? 'visible'
                                            : 'hidden'
                                    }
                                    variants={{
                                        visible: { opacity: 1, scale: 1 },
                                        hidden: { opacity: 0, scale: 0 },
                                    }}
                                />
                            </Tooltip>
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
                        <Tooltip label="Dateien hochladen">
                            <AnimatedButton
                                aria-label="Dateien hochladen"
                                data-testid="FileExplorerToolbarNewUploadButton"
                                onlyIcon
                                icon={
                                    <CloudUploadOutlined color={'secondary'} />
                                }
                                animate={
                                    state.currentPath.length > 1
                                        ? 'visible'
                                        : 'hidden'
                                }
                                variants={{
                                    visible: { opacity: 1, scale: 1 },
                                    hidden: { opacity: 0, scale: 0 },
                                }}
                            >
                                <input
                                    multiple
                                    type={'file'}
                                    className={styles.uploadButton}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            Array.from(e.target.files).forEach(
                                                (file) =>
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
                            </AnimatedButton>
                        </Tooltip>
                    )}
                    {!isMobile && state.mode === FileExplorerMode.ViewAndEdit && (
                        <Tooltip
                            label={`Info-Leiste für Dateien und Ordner ${
                                state.detailSidebarEnabled
                                    ? 'ausblenden'
                                    : 'einblenden'
                            }`}
                        >
                            <AnimatedButton
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
                                animate={
                                    state.currentPath.length > 1
                                        ? 'visible'
                                        : 'hidden'
                                }
                                variants={{
                                    visible: { opacity: 1, scale: 1 },
                                    hidden: { opacity: 0, scale: 0 },
                                }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Toolbar>
        </>
    );
});
FileToolbar.displayName = 'FileToolbar';
