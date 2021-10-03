import * as React from 'react';
import { DirectoryModel, FileModel } from 'model';
import { File } from 'util/model';
import {
    InputAdornment,
    TableCell,
    TextField,
    Tooltip,
    CircularProgress,
} from '@material-ui/core';
import { Done } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { Button } from 'component/general/button/Button';
import { useServerData } from 'component/ServerDataContext';
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

            const [updateFile, { loading: isLoadingUpdateFile }] = useMutation(
                UpdateFileMutation,
                {
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
                }
            );
            const [updateDirectory, { loading: isLoadingUpdateDirectory }] =
                useMutation(UpdateDirectoryMutation, {
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
                    <TableCell scope="row" className={styles.root}>
                        <form
                            style={{ width: '100%' }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newFilename.length > 0) {
                                    move();
                                }
                            }}
                        >
                            <TextField
                                fullWidth
                                inputRef={renamingInputRef}
                                value={newFilename}
                                onChange={(e) => setNewFilename(e.target.value)}
                                InputProps={{
                                    endAdornment:
                                        isLoadingUpdateFile ||
                                        isLoadingUpdateDirectory ? (
                                            <InputAdornment position={'end'}>
                                                <CircularProgress
                                                    style={{
                                                        width: '1em',
                                                        height: '1em',
                                                    }}
                                                />
                                            </InputAdornment>
                                        ) : (
                                            <InputAdornment position={'end'}>
                                                <Button
                                                    icon={<Done />}
                                                    aria-label={'OK'}
                                                    disabled={
                                                        newFilename.length < 1
                                                    }
                                                    onMouseDown={(
                                                        e: React.MouseEvent<any>
                                                    ) => {
                                                        e.preventDefault();
                                                        move();
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                }}
                            />
                        </form>
                    </TableCell>
                );
            }

            const previewImageUrl = File.getPreviewImageLocation(baseUrl, file);

            const tableCell = (
                <TableCell
                    scope="row"
                    className={styles.root}
                    onClick={(e) => {
                        e.preventDefault();
                        onSelect?.();
                    }}
                >
                    {file?.filename ?? directory!.name}
                </TableCell>
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
