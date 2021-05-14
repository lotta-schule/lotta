import * as React from 'react';
import {
    TableRow,
    TableCell,
    Menu,
    MenuItem,
    makeStyles,
    fade,
} from '@material-ui/core';
import { MoreVert, CreateOutlined, FileCopyOutlined } from '@material-ui/icons';
import { Button } from 'component/general/button/Button';
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

export interface FileTableRowProps {
    directory: DirectoryModel;
}

const useStyles = makeStyles((theme) => ({
    root: {},
    isDragActive: {
        backgroundColor: fade(theme.palette.secondary.main, 0.075),
    },
    dragHelpText: {
        display: 'block',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#333',
        fontSize: '1.2rem',
        textShadow: '1px 1px 4px #f523',
    },
}));

export const DirectoryTableRow = React.memo<FileTableRowProps>(
    ({ directory }) => {
        const styles = useStyles();
        const [state, dispatch] = React.useContext(fileExplorerContext);
        const currentUser = useCurrentUser();
        const [
            editMenuAnchorEl,
            setEditMenuAnchorEl,
        ] = React.useState<null | HTMLElement>(null);
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
            <TableRow
                hover={!isDragActive}
                className={clsx({
                    selected: !isDragActive && isMarked,
                    [styles.isDragActive]: isDragActive,
                })}
                {...getRootProps()}
            >
                <TableCell>{/* checkbox column */}</TableCell>
                <TableCell>{File.getIconForDirectory(directory)}</TableCell>
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
                <TableCell align="right">&nbsp;</TableCell>
                {state.mode === FileExplorerMode.ViewAndEdit && (
                    <TableCell>
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
                    </TableCell>
                )}
            </TableRow>
        );
    }
);
