import * as React from 'react';
import { MoreVert, CreateOutlined, FileCopyOutlined } from '@material-ui/icons';
import { Menu, MenuItem, MenuList } from 'shared/general/menu';
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
        const [isRenaming, setIsRenaming] = React.useState(false);

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
                    isRenaming={isRenaming}
                    onCompleteRenaming={() => setIsRenaming(false)}
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
                                <Menu
                                    buttonProps={{
                                        icon: <MoreVert fontSize="inherit" />,
                                        className: clsx(
                                            'lotta-navigation-button',
                                            'secondary',
                                            'small',
                                            'usernavigation-button'
                                        ),
                                    }}
                                >
                                    <MenuList>
                                        <MenuItem
                                            leftSection={
                                                <CreateOutlined
                                                    color={'secondary'}
                                                />
                                            }
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                setIsRenaming(true);
                                            }}
                                        >
                                            Umbenennen
                                        </MenuItem>
                                        <MenuItem
                                            leftSection={
                                                <FileCopyOutlined
                                                    color={'secondary'}
                                                />
                                            }
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                dispatch({
                                                    type: 'showMoveDirectory',
                                                });
                                                dispatch({
                                                    type: 'setMarkedDirectories',
                                                    directories: [directory],
                                                });
                                            }}
                                        >
                                            Verschieben
                                        </MenuItem>
                                    </MenuList>
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
