import * as React from 'react';
import {
    MoreVert,
    CreateOutlined,
    CloudDownloadOutlined,
    FileCopyOutlined,
    DeleteOutlineOutlined,
} from '@material-ui/icons';
import { Menu, MenuItem, MenuList } from 'shared/general/menu';
import { ListItemProps } from 'shared/general/list/List';
import { FileModel, DirectoryModel } from 'model';
import { Checkbox } from 'shared/general/form/checkbox';
import { File } from 'util/model/File';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { FileTableRowFilenameCell } from './FileTableRowFilenameCell';
import { useServerData } from 'shared/ServerDataContext';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';
import uniqBy from 'lodash/uniqBy';
import clsx from 'clsx';

export interface FileTableRowProps {
    file: FileModel;
    onMark(e: React.MouseEvent): void;
}

export const FileTableRow = React.memo<FileTableRowProps>(
    ({ file, onMark }) => {
        const { baseUrl } = useServerData();
        const currentUser = useCurrentUser();
        const [isRenaming, setIsRenaming] = React.useState(false);
        const [state, dispatch] = React.useContext(fileExplorerContext);

        const isMarked =
            state.markedFiles.find((f) => f.id === file.id) !== undefined;
        const isSelected =
            state.selectedFiles.find((f) => f.id === file.id) !== undefined;

        const filesAreEditable =
            state.mode === FileExplorerMode.ViewAndEdit &&
            File.canEditDirectory(
                state.currentPath[
                    state.currentPath.length - 1
                ] as DirectoryModel,
                currentUser
            );

        return (
            <tr
                className={clsx({ selected: isMarked || isSelected })}
                onClick={onMark}
            >
                <td>
                    {state.mode === FileExplorerMode.SelectMultiple && (
                        <Checkbox
                            isReadOnly
                            aria-label={`Datei ${file.filename} auswählen`}
                            className={'select-file-checkbox'}
                            style={{ padding: 0 }}
                            isSelected={
                                state.selectedFiles.find(
                                    (f) => f.id === file.id
                                ) !== undefined
                            }
                            onChange={(isSelected) => {
                                dispatch({
                                    type: 'setSelectedFiles',
                                    files: isSelected
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
                </td>
                <td>{File.getIconForFile(file)}</td>
                <FileTableRowFilenameCell
                    file={file}
                    isRenaming={isRenaming}
                    onCompleteRenaming={() => setIsRenaming(false)}
                    onSelect={() => {}}
                />
                {filesAreEditable && (
                    <td>
                        <Menu
                            buttonProps={{
                                small: true,
                                icon: <MoreVert fontSize="inherit" />,
                                'aria-label': 'delete',
                            }}
                        >
                            <MenuList>
                                <MenuItem
                                    key={'download'}
                                    onClick={(e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    }
                                    href={File.getFileRemoteLocation(
                                        baseUrl,
                                        file
                                    )}
                                    download={file.filename}
                                    leftSection={
                                        <CloudDownloadOutlined
                                            color={'secondary'}
                                        />
                                    }
                                >
                                    Herunterladen
                                </MenuItem>
                                <MenuItem isDivider />
                                <MenuItem
                                    leftSection={
                                        <CreateOutlined color={'secondary'} />
                                    }
                                    onClick={() => setIsRenaming(true)}
                                >
                                    Umbenennen
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        dispatch({ type: 'showMoveFiles' });
                                        dispatch({
                                            type: 'setMarkedFiles',
                                            files: [file],
                                        });
                                    }}
                                    leftSection={
                                        <FileCopyOutlined color={'secondary'} />
                                    }
                                >
                                    Verschieben
                                </MenuItem>
                                <MenuItem
                                    leftSection={
                                        <DeleteOutlineOutlined
                                            color={'secondary'}
                                        />
                                    }
                                    key={'delete'}
                                    onClick={() => {
                                        dispatch({ type: 'showDeleteFiles' });
                                        dispatch({
                                            type: 'setMarkedFiles',
                                            files: [file],
                                        });
                                    }}
                                >
                                    Löschen
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </td>
                )}
            </tr>
        );
    }
);
FileTableRow.displayName = 'FileTableRow';
