import React, {
    MouseEvent,
    memo,
    useState,
    useCallback,
    useContext,
} from 'react';
import {
    TableRow,
    TableCell,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    Divider,
} from '@material-ui/core';
import {
    MoreVert,
    CreateOutlined,
    CloudDownloadOutlined,
    FileCopyOutlined,
    DeleteOutlineOutlined,
} from '@material-ui/icons';
import { FileModel, DirectoryModel } from 'model';
import { File } from 'util/model/File';
import { FileTableRowFilenameCell } from './FileTableRowFilenameCell';
import { useCurrentUser } from 'util/user/useCurrentUser';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';
import clsx from 'clsx';
import uniqBy from 'lodash/uniqBy';

export interface FileTableRowProps {
    file: FileModel;
    onMark(e: MouseEvent): void;
}

export const FileTableRow = memo<FileTableRowProps>(({ file, onMark }) => {
    const currentUser = useCurrentUser();
    const [
        editMenuAnchorEl,
        setEditMenuAnchorEl,
    ] = useState<null | HTMLElement>(null);
    const [isRenamingFile, setIsRenamingFile] = useState(false);
    const [state, dispatch] = useContext(fileExplorerContext);

    const handleEditMenuClose = () => {
        setEditMenuAnchorEl(null);
    };

    const handleEditMenuClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            setEditMenuAnchorEl(event.currentTarget);
        },
        []
    );

    const handleEditMenuClickRename = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            setEditMenuAnchorEl(null);
            setIsRenamingFile(true);
        },
        []
    );
    const handleEditMenuClickMove = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            setEditMenuAnchorEl(null);
            dispatch({ type: 'showMoveFiles' });
            dispatch({ type: 'setMarkedFiles', files: [file] });
        },
        [dispatch, file]
    );
    const handleEditMenuClickDelete = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            setEditMenuAnchorEl(null);
            dispatch({ type: 'showDeleteFiles' });
            dispatch({ type: 'setMarkedFiles', files: [file] });
        },
        [dispatch, file]
    );

    const isMarked =
        state.markedFiles.find((f) => f.id === file.id) !== undefined;
    const isSelected =
        state.selectedFiles.find((f) => f.id === file.id) !== undefined;

    const filesAreEditable =
        state.mode === FileExplorerMode.ViewAndEdit &&
        File.canEditDirectory(
            state.currentPath[state.currentPath.length - 1] as DirectoryModel,
            currentUser
        );

    return (
        <TableRow
            hover
            className={clsx({ selected: isMarked || isSelected })}
            onClick={onMark}
        >
            <TableCell>
                {state.mode === FileExplorerMode.SelectMultiple && (
                    <Checkbox
                        style={{ padding: 0 }}
                        checked={
                            state.selectedFiles.find(
                                (f) => f.id === file.id
                            ) !== undefined
                        }
                        onChange={(e, checked) => {
                            dispatch({
                                type: 'setSelectedFiles',
                                files: checked
                                    ? uniqBy(
                                          [...state.selectedFiles, file],
                                          'id'
                                      )
                                    : state.selectedFiles.filter(
                                          (f) => f.id !== file.id
                                      ),
                            });
                        }}
                    />
                )}
            </TableCell>
            <TableCell>{File.getIconForFile(file)}</TableCell>
            <FileTableRowFilenameCell
                file={file}
                isRenaming={isRenamingFile}
                onCompleteRenaming={() => setIsRenamingFile(false)}
                onSelect={() => {}}
            />
            {filesAreEditable && (
                <TableCell>
                    <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={handleEditMenuClick}
                    >
                        <MoreVert fontSize="inherit" />
                    </IconButton>
                    <Menu
                        anchorEl={editMenuAnchorEl}
                        open={Boolean(editMenuAnchorEl)}
                        onClose={() => handleEditMenuClose()}
                    >
                        {[
                            <MenuItem
                                key={'download'}
                                onClick={(e: MouseEvent) => e.stopPropagation()}
                                component={'a'}
                                href={File.getSameOriginUrl(file)}
                                download={file.filename}
                            >
                                <CloudDownloadOutlined color={'secondary'} />
                                &nbsp;Herunterladen
                            </MenuItem>,
                            <Divider key={'divider-download'} />,
                            <MenuItem
                                key={'rename'}
                                onClick={(e) => handleEditMenuClickRename(e)}
                            >
                                <CreateOutlined color={'secondary'} />
                                &nbsp;Umbenennen
                            </MenuItem>,
                            <MenuItem
                                key={'move'}
                                onClick={(e) => handleEditMenuClickMove(e)}
                            >
                                <FileCopyOutlined color={'secondary'} />
                                &nbsp;Verschieben
                            </MenuItem>,
                            <MenuItem
                                key={'delete'}
                                onClick={(e) => handleEditMenuClickDelete(e)}
                            >
                                <DeleteOutlineOutlined color={'secondary'} />
                                &nbsp;Löschen
                            </MenuItem>,
                        ]}
                    </Menu>
                </TableCell>
            )}
        </TableRow>
    );
});
