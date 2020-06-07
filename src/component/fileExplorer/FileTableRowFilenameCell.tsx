import React, { memo, useEffect, useLayoutEffect, useRef, useState, useContext } from 'react';
import { DirectoryModel, FileModel } from 'model';
import { File } from 'util/model';
import { IconButton, InputAdornment, TableCell, TextField, Tooltip, makeStyles, CircularProgress } from '@material-ui/core';
import { Done } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { UpdateFileMutation } from 'api/mutation/UpdateFileMutation';
import { UpdateDirectoryMutation } from 'api/mutation/UpdateDirectoryMutation';
import fileExplorerContext from './context/FileExplorerContext';

export interface FileTableRowFilenameCellProps {
    file?: FileModel;
    directory?: DirectoryModel;
    isRenaming: boolean;
    onCompleteRenaming(): void;
    onSelect(): void;
}

const useStyles = makeStyles(() => ({
    root: {
    },
    tooltip: {
        backgroundColor: 'transparent'
    }
}));

export const FileTableRowFilenameCell = memo<FileTableRowFilenameCellProps>(({ file, directory, isRenaming, onCompleteRenaming, onSelect }) => {
    const styles = useStyles();
    const [{ currentPath }] = useContext(fileExplorerContext);
    const [newFilename, setNewFilename] = useState(file?.filename ?? directory!.name);

    const renamingInputRef = useRef<HTMLInputElement>();
    useLayoutEffect(() => {
        if (renamingInputRef.current) {
            renamingInputRef.current.focus();
            renamingInputRef.current.addEventListener('blur', () => {
                onCompleteRenaming();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renamingInputRef.current]);

    useEffect(() => {
        setNewFilename(file?.filename ?? directory!.name);
    }, [directory, file, isRenaming]);

    const [updateFile, { loading: isLoadingUpdateFile }] = useMutation(UpdateFileMutation, {
        variables: {
            id: file?.id,
            filename: newFilename
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
                        id: currentPath[currentPath.length - 1]!.id
                    },
                    updatedAt: new Date().toISOString()
                }
            } as any;
        },
        onCompleted: () => {
            onCompleteRenaming();
            renamingInputRef.current?.blur();
        }
    });
    const [updateDirectory, { loading: isLoadingUpdateDirectory }] = useMutation(UpdateDirectoryMutation, {
        variables: {
            id: directory?.id,
            name: newFilename
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
                        id: currentPath[currentPath.length - 1]!.id
                    },
                    updatedAt: new Date().toISOString()
                }
            } as any;
        },
        onCompleted: () => {
            onCompleteRenaming();
            renamingInputRef.current?.blur();
        }
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
                <form style={{ width: '100%' }} onSubmit={e => {
                    e.preventDefault();
                    if (newFilename.length > 0) {
                        move();
                    }
                }}>
                    <TextField
                        fullWidth
                        inputRef={renamingInputRef}
                        value={newFilename}
                        onChange={e => setNewFilename(e.target.value)}
                        InputProps={{
                            endAdornment: (isLoadingUpdateFile || isLoadingUpdateDirectory) ? (
                                <InputAdornment position={'end'}>
                                    <CircularProgress style={{ width: '1em', height: '1em' }} />
                                </InputAdornment>
                            ) : (
                                    <InputAdornment position={'end'}>
                                        <IconButton
                                            aria-label="OK"
                                            disabled={newFilename.length < 1}
                                            color={'secondary'}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                                move();
                                            }}
                                        >
                                            <Done />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                        }}
                    />
                </form>
            </TableCell>
        );
    }

    const previewImageUrl = File.getPreviewImageLocation(file);

    const tableCell = (
        <TableCell scope="row" className={styles.root} onClick={e => {
            e.preventDefault();
            onSelect?.();
        }}>
            {file?.filename ?? directory!.name}
        </TableCell>
    );

    if (previewImageUrl) {
        return (
            <Tooltip className={styles.tooltip} title={(
                <img
                    src={previewImageUrl}
                    alt={file!.filename}
                />
            )}>
                {tableCell}
            </Tooltip>
        );
    } else {
        return tableCell;
    }
});
