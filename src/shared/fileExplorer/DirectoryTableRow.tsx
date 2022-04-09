import * as React from 'react';
import { Menu, MenuItem } from '@material-ui/core';
import { MoreVert, CreateOutlined, FileCopyOutlined } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { DirectoryModel } from 'model';
import { File } from 'util/model/File';
import { FileTableRowFilenameCell } from './FileTableRowFilenameCell';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useCreateUpload } from './context/UploadQueueContext';
import { useDropzone } from 'react-dropzone';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';
import clsx from 'clsx';

import styles from './DirectoryTableRow.module.scss';

export interface FileTableRowProps {
    directory: DirectoryModel;
}

export const DirectoryTableRow = React.memo<FileTableRowProps>(
    ({ directory }) => {
        const [state, dispatch] = React.useContext(fileExplorerContext);
        const currentUser = useCurrentUser();
        const [editMenuAnchorEl, setEditMenuAnchorEl] =
            React.useState<null | HTMLElement>(null);
        const [isRenamingFile, setIsRenamingFile] = React.useState(false);

        const uploadFile = useCreateUpload();
        const { getRootProps, isDragActive } = useDropzone({
            onDrop: (files) => {
                files.forEach((f) => uploadFile(f, directory));
            },
            multiple: true,
            preventDropOnDocument: true,
            noClick: true,
            noDragEventsBubbling: true,
        });

        const handleEditMenuClose = () => {
            setEditMenuAnchorEl(null);
        };

        const handleEditMenuClick = React.useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                setEditMenuAnchorEl(event.currentTarget);
            },
            []
        );

        const handleEditMenuClickRename = React.useCallback(
            (event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                setEditMenuAnchorEl(null);
                setIsRenamingFile(true);
            },
            []
        );
        const handleEditMenuClickMove = React.useCallback(
            (event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                setEditMenuAnchorEl(null);
                dispatch({ type: 'showMoveDirectory' });
                dispatch({
                    type: 'setMarkedDirectories',
                    directories: [directory],
                });
            },
            [directory, dispatch]
        );

        const isMarked =
            state.markedDirectories.find((d) => d.id === directory.id) !==
            undefined;

        return (
            <tr
                className={clsx(styles.root, {
                    selected: !isDragActive && isMarked,
                    [styles.isDragActive]: isDragActive,
                })}
                {...getRootProps()}
                role={'row'}
            >
                <td>{/* checkbox column */}</td>
                <td>{File.getIconForDirectory(directory)}</td>
                <FileTableRowFilenameCell
                    directory={directory}
                    isRenaming={isRenamingFile}
                    onCompleteRenaming={() => setIsRenamingFile(false)}
                    onSelect={() =>
                        dispatch({
                            type: 'setPath',
                            path: [...state.currentPath, directory],
                        })
                    }
                />
                <td align="right">&nbsp;</td>
                {state.mode === FileExplorerMode.ViewAndEdit && (
                    <td>
                        {File.canEditDirectory(directory, currentUser) && (
                            <>
                                <Button
                                    small
                                    icon={<MoreVert fontSize="inherit" />}
                                    aria-label={'delete'}
                                    onClick={handleEditMenuClick}
                                />

                                <Menu
                                    anchorEl={editMenuAnchorEl}
                                    open={Boolean(editMenuAnchorEl)}
                                    onClose={() => handleEditMenuClose()}
                                >
                                    <MenuItem
                                        key={'rename'}
                                        onClick={(e) =>
                                            handleEditMenuClickRename(e)
                                        }
                                    >
                                        <CreateOutlined color={'secondary'} />
                                        &nbsp;Umbenennen
                                    </MenuItem>
                                    ,
                                    <MenuItem
                                        key={'move'}
                                        onClick={(e) =>
                                            handleEditMenuClickMove(e)
                                        }
                                    >
                                        <FileCopyOutlined color={'secondary'} />
                                        &nbsp;Verschieben
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </td>
                )}
            </tr>
        );
    }
);
DirectoryTableRow.displayName = 'DirectoryTableRow';
