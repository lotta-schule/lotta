import * as React from 'react';
import {
    Button,
    Checkbox,
    CircularProgress,
    ErrorMessage,
    Table,
} from '@lotta-schule/hubert';
import { ArrowBackRounded } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { every, range, uniqBy } from 'lodash';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { FileModel, FileModelType, DirectoryModel } from 'model';
import { DirectoryTableRow } from './DirectoryTableRow';
import { FileTableRow } from './FileTableRow';
import { FileTableFooter } from './FileTableFooter';
import { useCreateUpload } from './context/UploadQueueContext';
import { EmptyDirectoryTableRow } from './EmptyDirectoryTableRow';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import clsx from 'clsx';

import styles from './FileTable.module.scss';

export interface FileTableProps {
    fileFilter?(file: FileModel): boolean;
}

export const FileTable = React.memo<FileTableProps>(({ fileFilter }) => {
    const { t } = useTranslation();
    const [state, dispatch] = React.useContext(fileExplorerContext);
    const filesAreEditable = state.mode === FileExplorerMode.ViewAndEdit;

    const {
        data,
        error,
        loading: isLoading,
    } = useQuery<{
        directories: DirectoryModel[];
        files: FileModel[];
    }>(GetDirectoriesAndFilesQuery, {
        variables: {
            parentDirectoryId:
                state.currentPath[state.currentPath.length - 1].id ?? null,
        },
    });

    const filteredSortedFiles = React.useMemo(
        () =>
            data?.files
                .filter((file) => {
                    const byFileFilter = !fileFilter || fileFilter(file);
                    let bySearchFilter = true;
                    try {
                        bySearchFilter =
                            !state.searchtext ||
                            new RegExp(state.searchtext, 'i').test(
                                file.filename
                            );
                    } catch {}
                    return byFileFilter && bySearchFilter;
                })
                .sort((f1, f2) => f1.filename.localeCompare(f2.filename)) ?? [],
        [data, fileFilter, state.searchtext]
    );

    const uploadFile = useCreateUpload();
    const { getRootProps, acceptedFiles, isDragAccept, isDragActive } =
        useDropzone({
            onDrop: (files) => {
                files.forEach((f) =>
                    uploadFile(
                        f,
                        state.currentPath[
                            state.currentPath.length - 1
                        ] as DirectoryModel
                    )
                );
            },
            disabled: state.currentPath.length < 2,
            multiple: true,
            preventDropOnDocument: true,
            noClick: true,
        });

    const isMarked = (file: FileModel) => {
        if (!file) {
            return false;
        }
        return state.markedFiles.findIndex((f) => f.id === file.id) > -1;
    };

    const findNearest = (number: number, listOfNumbers: number[]) => {
        return listOfNumbers.reduce((prev: number | null, value) => {
            if (!prev) {
                return value;
            }
            return Math.abs(value - number) < Math.abs(prev - number)
                ? value
                : prev;
        }, null) as number;
    };

    const toggleFileMarked = (e: React.MouseEvent, file: FileModel) => {
        e.preventDefault();
        if (isMarked(file)) {
            if (e.metaKey) {
                dispatch({
                    type: 'setMarkedFiles',
                    files: state.markedFiles.filter((f) => f.id !== file.id),
                });
            } else {
                dispatch({ type: 'markSingleFile', file });
            }
        } else {
            if (e.shiftKey) {
                const fileIndex = filteredSortedFiles.findIndex(
                    (f) => f.id === file.id
                );
                const markedFileIndexes = state.markedFiles.map((file) =>
                    filteredSortedFiles.findIndex((f) => f.id === file.id)
                );
                const nearestIndex = findNearest(fileIndex, markedFileIndexes);
                const indexesRange = [
                    ...range(
                        Math.min(fileIndex, nearestIndex),
                        Math.max(fileIndex, nearestIndex)
                    ),
                    ...(fileIndex > nearestIndex ? [fileIndex] : []),
                ];
                dispatch({
                    type: 'setMarkedFiles',
                    files: [
                        ...state.markedFiles,
                        ...indexesRange
                            .map((findex) => filteredSortedFiles[findex])
                            .filter((f) => !isMarked(f)),
                    ],
                });
            } else if (e.metaKey) {
                dispatch({
                    type: 'setMarkedFiles',
                    files: [...state.markedFiles, file],
                });
            } else {
                dispatch({ type: 'markSingleFile', file });
            }
        }
    };

    const filteredSortedDirectories = React.useMemo(
        () =>
            data?.directories
                .filter((_directory) => true)
                .sort((d1, d2) => d1.name.localeCompare(d2.name)) ?? [],
        [data]
    );

    const lowestSelectedFileIndex = React.useMemo(() => {
        if (!state.markedFiles.length) {
            return null;
        }
        return state.markedFiles.reduce<number | null>(
            (currentLowestIndex, file) => {
                const currentIndex = filteredSortedFiles.findIndex(
                    (sortedFile) => sortedFile.id === file.id
                );
                return currentLowestIndex
                    ? Math.min(currentLowestIndex, currentIndex)
                    : currentIndex;
            },
            null
        );
    }, [state.markedFiles, filteredSortedFiles]);
    const highestSelectedFileIndex = React.useMemo(() => {
        if (!state.markedFiles.length) {
            return null;
        }
        return state.markedFiles.reduce<number | null>(
            (currentHighestIndex, file) => {
                const currentIndex = filteredSortedFiles.findIndex(
                    (sortedFile) => sortedFile.id === file.id
                );
                return currentHighestIndex
                    ? Math.max(currentHighestIndex, currentIndex)
                    : currentIndex;
            },
            null
        );
    }, [state.markedFiles, filteredSortedFiles]);

    const onKeyDown = React.useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                if (state.markedFiles.length) {
                    if (
                        lowestSelectedFileIndex !== null &&
                        lowestSelectedFileIndex > 0
                    ) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            dispatch({
                                type: 'setMarkedFiles',
                                files: [
                                    ...state.markedFiles,
                                    filteredSortedFiles[
                                        lowestSelectedFileIndex - 1
                                    ],
                                ],
                            });
                        } else {
                            dispatch({
                                type: 'markSingleFile',
                                file: filteredSortedFiles[
                                    lowestSelectedFileIndex - 1
                                ],
                            });
                        }
                    }
                }
            }
            if (e.key === 'ArrowDown') {
                if (state.markedFiles.length) {
                    if (
                        highestSelectedFileIndex !== null &&
                        highestSelectedFileIndex <
                            filteredSortedFiles.length - 1
                    ) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            dispatch({
                                type: 'setMarkedFiles',
                                files: [
                                    ...state.markedFiles,
                                    filteredSortedFiles[
                                        highestSelectedFileIndex + 1
                                    ],
                                ],
                            });
                        } else {
                            dispatch({
                                type: 'markSingleFile',
                                file: filteredSortedFiles[
                                    highestSelectedFileIndex + 1
                                ],
                            });
                        }
                    }
                }
            }
        },
        [
            dispatch,
            filteredSortedFiles,
            highestSelectedFileIndex,
            lowestSelectedFileIndex,
            state.markedFiles,
        ]
    );

    React.useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);

    return (
        <div
            {...getRootProps()}
            className={clsx(styles.root, {
                [styles.isDragActive]: isDragActive,
                [styles.isDragAccept]: isDragAccept,
                [styles.isEditable]: filesAreEditable,
            })}
        >
            {!isDragAccept && isDragActive && (
                <div className={styles.dragHelpText}>
                    Dateien hierher ziehen
                </div>
            )}
            {isDragAccept && (
                <div className={styles.dragHelpText}>
                    {t('files.explorer.dropFilesToUpload', {
                        count: acceptedFiles.length,
                    })}
                </div>
            )}
            <ErrorMessage error={error} />
            <Table className={styles.table}>
                <thead>
                    <tr>
                        <td>
                            {!isLoading &&
                                state.mode ===
                                    FileExplorerMode.SelectMultiple &&
                                (data?.files?.length ?? 0) > 0 && (
                                    <Checkbox
                                        style={{ padding: 0 }}
                                        aria-label={'Alle wählen'}
                                        isSelected={every(
                                            filteredSortedFiles.filter(
                                                (f) =>
                                                    f.fileType !==
                                                    FileModelType.Directory
                                            ),
                                            (f) =>
                                                state.selectedFiles.includes(f)
                                        )}
                                        onChange={(isSelected) => {
                                            dispatch({
                                                type: 'setSelectedFiles',
                                                files: isSelected
                                                    ? uniqBy(
                                                          [
                                                              ...state.selectedFiles,
                                                              ...filteredSortedFiles,
                                                          ],
                                                          'id'
                                                      )
                                                    : state.selectedFiles.filter(
                                                          (selectedFile) =>
                                                              !filteredSortedFiles.includes(
                                                                  selectedFile
                                                              )
                                                      ),
                                            });
                                        }}
                                    />
                                )}
                        </td>
                        <td>
                            {isLoading && (
                                <CircularProgress
                                    size={'1rem'}
                                    style={{
                                        display: 'inline-block',
                                        marginBottom: 2,
                                    }}
                                    isIndeterminate
                                    aria-label={
                                        'Dateien für diesen Ordner werden geladen'
                                    }
                                />
                            )}
                            {!isLoading && state.currentPath.length > 1 && (
                                <Button
                                    small
                                    icon={<ArrowBackRounded />}
                                    onClick={() =>
                                        dispatch({
                                            type: 'setPath',
                                            path: state.currentPath.slice(
                                                0,
                                                state.currentPath.length - 1
                                            ),
                                        })
                                    }
                                />
                            )}
                        </td>
                        <td>
                            {!isLoading && state.currentPath.length < 2 && (
                                <strong>
                                    Wähle einen Ordner um Dateien hochzuladen.
                                </strong>
                            )}
                            {state.currentPath.length > 1 && 'Dateiname'}
                        </td>
                        {state.mode === FileExplorerMode.ViewAndEdit && (
                            <td>&nbsp;</td>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filteredSortedDirectories.map((directory) => (
                        <DirectoryTableRow
                            key={`dir-${directory.id}`}
                            directory={directory}
                        />
                    ))}
                    {filteredSortedFiles.map((file) => (
                        <FileTableRow
                            key={`file-${file.id}`}
                            file={file}
                            onMark={(e) => {
                                if (state.mode === FileExplorerMode.Select) {
                                    dispatch({
                                        type: 'setSelectedFiles',
                                        files: [file],
                                    });
                                } else if (
                                    state.mode ===
                                    FileExplorerMode.SelectMultiple
                                ) {
                                    if (
                                        state.selectedFiles.find(
                                            (sf) => sf.id === file.id
                                        )
                                    ) {
                                        // file is already selected. Deselect
                                        dispatch({
                                            type: 'setSelectedFiles',
                                            files: state.selectedFiles.filter(
                                                (sf) => sf.id != file.id
                                            ),
                                        });
                                    } else {
                                        dispatch({
                                            type: 'setSelectedFiles',
                                            files: [
                                                ...state.selectedFiles,
                                                file,
                                            ],
                                        });
                                    }
                                } else {
                                    toggleFileMarked(e, file);
                                }
                            }}
                        />
                    ))}
                    {state.currentPath.length > 1 &&
                        data?.files.length === 0 &&
                        data?.directories.length === 0 && (
                            <EmptyDirectoryTableRow />
                        )}
                </tbody>
            </Table>
            <FileTableFooter />
        </div>
    );
});
FileTable.displayName = 'FileTable';
