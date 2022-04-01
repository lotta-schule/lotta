import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { DirectoryModel, FileModel } from 'model';
import { File } from 'util/model';
import { Input } from 'shared/general/form/input/Input';
import { useServerData } from 'shared/ServerDataContext';
import fileExplorerContext from './context/FileExplorerContext';

import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

import styles from './FileTableRowFilenameCell.module.scss';

export interface FileTableRowFilenameCellProps {
    file?: FileModel;
    directory?: DirectoryModel;
    isRenaming: boolean;
    onCompleteRenaming(): void;
    onSelect(): void;
}

export const FileTableRowFilenameCell =
    React.memo<FileTableRowFilenameCellProps>(
        ({ file, directory, isRenaming, onCompleteRenaming, onSelect }) => {
            const { baseUrl } = useServerData();
            const [{ currentPath }] = React.useContext(fileExplorerContext);
            const [newFilename, setNewFilename] = React.useState(
                file?.filename ?? directory!.name
            );

            const renamingInputRef = React.useRef<HTMLInputElement>();

            React.useLayoutEffect(() => {
                if (renamingInputRef.current) {
                    renamingInputRef.current.focus();
                    renamingInputRef.current.addEventListener('blur', () => {
                        onCompleteRenaming();
                    });
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [renamingInputRef.current]);

            React.useEffect(() => {
                setNewFilename(file?.filename ?? directory!.name);
            }, [directory, file, isRenaming]);

            const [updateFile] = useMutation(UpdateFileMutation, {
                variables: {
                    id: file?.id,
                    filename: newFilename,
                },
                optimisticResponse: ({ id, filename }) => {
                    renamingInputRef.current?.blur();
                    return {
                        __typename: 'Mutation',
                        file: {
                            __typename: 'File',
                            id,
                            filename,
                            parentDirectory: {
                                __typename: 'Directory',
                                id: currentPath[currentPath.length - 1]!.id,
                            },
                            updatedAt: new Date().toISOString(),
                        },
                    } as any;
                },
                onCompleted: () => {
                    onCompleteRenaming();
                    renamingInputRef.current?.blur();
                },
            });
            const [updateDirectory] = useMutation(UpdateDirectoryMutation, {
                variables: {
                    id: directory?.id,
                    name: newFilename,
                },
                optimisticResponse: ({ id, name }) => {
                    renamingInputRef.current?.blur();
                    return {
                        __typename: 'Mutation',
                        directory: {
                            __typename: 'Directory',
                            id,
                            name,
                            parentDirectory: {
                                __typename: 'Directory',
                                id: currentPath[currentPath.length - 1]!.id,
                            },
                            updatedAt: new Date().toISOString(),
                        },
                    } as any;
                },
                onCompleted: () => {
                    onCompleteRenaming();
                    renamingInputRef.current?.blur();
                },
            });

            const move = () => {
                if (file) {
                    updateFile();
                } else if (directory) {
                    updateDirectory();
                }
            };

            if (isRenaming) {
                return (
                    <td scope="row" className={styles.root}>
                        <form
                            style={{ width: '100%' }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newFilename.length > 0) {
                                    move();
                                }
                            }}
                        >
                            <Input
                                autoFocus
                                ref={renamingInputRef}
                                value={newFilename}
                                onChange={(e) =>
                                    setNewFilename(e.currentTarget.value)
                                }
                            />
                        </form>
                    </td>
                );
            }

            const previewImageUrl = File.getPreviewImageLocation(baseUrl, file);

            const tableCell = (
                <td
                    scope="row"
                    className={styles.root}
                    onClick={(e) => {
                        e.preventDefault();
                        onSelect?.();
                    }}
                >
                    {file?.filename ?? directory!.name}
                </td>
            );

            if (previewImageUrl) {
                return (
                    <Tooltip
                        className={styles.tooltip}
                        title={
                            <img src={previewImageUrl} alt={file!.filename} />
                        }
                    >
                        {tableCell}
                    </Tooltip>
                );
            } else {
                return tableCell;
            }
        }
    );
FileTableRowFilenameCell.displayName = 'FileTableRowFilenameCell';
