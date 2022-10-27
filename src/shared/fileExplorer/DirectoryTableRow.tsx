import * as React from 'react';

import { Icon } from 'shared/Icon';
import {
    faCopy,
    faEllipsisVertical,
    faPen,
} from '@fortawesome/free-solid-svg-icons';
import { MenuButton, Item } from '@lotta-schule/hubert';
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
                                <MenuButton
                                    title={'Ordnermenü'}
                                    buttonProps={{
                                        icon: (
                                            <Icon
                                                icon={faEllipsisVertical}
                                                size={'lg'}
                                            />
                                        ),
                                        'aria-label': 'Ordnermenü öffnen',
                                        className: clsx(
                                            'lotta-navigation-button',
                                            'secondary',
                                            'small',
                                            'usernavigation-button'
                                        ),
                                    }}
                                    onAction={(action) => {
                                        switch (action) {
                                            case 'rename':
                                                setIsRenaming(true);
                                                break;
                                            case 'move':
                                                dispatch({
                                                    type: 'showMoveDirectory',
                                                });
                                                dispatch({
                                                    type: 'setMarkedDirectories',
                                                    directories: [directory],
                                                });
                                                break;
                                        }
                                    }}
                                >
                                    <Item
                                        key={'rename'}
                                        textValue={'Umbenennen'}
                                    >
                                        <Icon
                                            icon={faPen}
                                            size={'lg'}
                                            color={'secondary'}
                                        />
                                        Umbenennen
                                    </Item>
                                    <Item
                                        key={'move'}
                                        textValue={'Verschieben'}
                                    >
                                        <Icon icon={faCopy} size={'lg'} />
                                        Verschieben
                                    </Item>
                                </MenuButton>
                            </>
                        )}
                    </td>
                )}
            </tr>
        );
    }
);
DirectoryTableRow.displayName = 'DirectoryTableRow';
