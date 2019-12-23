import React, { MouseEvent, memo } from 'react';
import { includes, some, every, uniqBy, findIndex, range } from 'lodash';
import {
    Table, TableHead, TableRow, TableCell, TableBody, Theme, Checkbox
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FileModel, FileModelType, ID } from 'model';
import { FileTableRow } from './FileTableRow';

const useStyles = makeStyles<Theme, { filesAreEditable: boolean }>((theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        '& thead': {
            display: 'flex',
            width: '100%',
        },
        '& tbody': {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflowY: 'scroll',
            height: 600,
            '& tr': {
                cursor: 'pointer'
            }
        },
        '& tr': {
            display: 'flex',
            width: '100%',
            flexShrink: 0,
            boxSizing: 'border-box',
            '&.selected, &.selected:hover': {
                backgroundColor: theme.palette.action.selected
            },
            '& > td, & > th': {
                userSelect: 'none',
                padding: theme.spacing(1),
                boxSizing: 'border-box',
                '&:nth-child(1)': {
                    width: '10%',
                    display: ({ filesAreEditable }) => filesAreEditable ? 'none' : 'initial'
                },
                '&:nth-child(2)': {
                    width: '2em',
                },
                '&:nth-child(3)': {
                    width: 'auto',
                    flexGrow: 1,
                    flexShrink: 1
                },
                '&:nth-child(4)': {
                    width: '20%'
                },
                '&:nth-child(5)': {
                    width: '3em'
                }
            },
            '& > td': {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexGrow: 0,
                flexShrink: 0
            }
        }
    }
}));

export interface FileTableProps {
    files: FileModel[];
    selectedFiles: FileModel[];
    markedFileIds: ID[];
    canEditPublicFiles: boolean;
    isPublic: boolean;
    setMarkedFileIds(ids: ID[]): void;
    onSelectSubPath(path: string): void;
    onClickOpenMoveFilesDialog(file: FileModel): void;
    onClickDeleteFilesDialog(file: FileModel): void;
    onSelectFile?(file: FileModel): void;
    onSelectFiles?(files: FileModel[]): void;
}

export const FileTable = memo<FileTableProps>(({
    files, selectedFiles, markedFileIds, canEditPublicFiles, isPublic,
    setMarkedFileIds, onSelectSubPath, onSelectFile, onSelectFiles, onClickOpenMoveFilesDialog, onClickDeleteFilesDialog
}) => {
    const filesAreEditable = !onSelectFile && !onSelectFiles;
    const styles = useStyles({ filesAreEditable });

    const isMarked = (file: FileModel) => {
        return markedFileIds.indexOf(file.id) > -1;
    };

    const findNearest = (number: number, listOfNumbers: number[]) => {
        return listOfNumbers.reduce((prev: number | null, value) => {
            if (!prev) {
                return value;
            }
            return (Math.abs(value - number) < Math.abs(prev - number)) ? value : prev;
        }, null) as number;
    }

    const toggleFileMarked = (file: FileModel) => (e: MouseEvent) => {
        e.preventDefault();
        if (isMarked(file)) {
            if (e.metaKey) {
                setMarkedFileIds(markedFileIds.filter(fId => fId !== file.id));
            } else {
                setMarkedFileIds([file.id]);
            }
        } else {
            if (e.shiftKey) {
                const fileIndex = findIndex(files, f => f.id === file.id);
                const markedFileIndexes = markedFileIds.map(fileId => findIndex(files, f => f.id === fileId));
                const nearestIndex = findNearest(fileIndex, markedFileIndexes);
                const indexesRange = [
                    ...range(Math.min(fileIndex, nearestIndex), Math.max(fileIndex, nearestIndex)),
                    ...(fileIndex > nearestIndex ? [fileIndex] : [])
                ];
                setMarkedFileIds([...markedFileIds, ...indexesRange.map(findex => files[findex]).filter(f => !isMarked(f)).map(f => f.id)]);
            } else if (e.metaKey) {
                setMarkedFileIds([...markedFileIds, file.id]);
            } else {
                setMarkedFileIds([file.id]);
            }
        }
    };

    return (
        <div>
            <Table size={'small'} className={styles.root}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            {onSelectFiles && (
                                <Checkbox
                                    indeterminate={!every(files.filter(f => f.fileType !== FileModelType.Directory), f => selectedFiles.includes(f)) && some(selectedFiles, selectedFile => files.includes(selectedFile))}
                                    checked={every(files.filter(f => f.fileType !== FileModelType.Directory), f => selectedFiles.includes(f))}
                                    onChange={(e, checked) => {
                                        e.preventDefault();
                                        if (checked) {
                                            onSelectFiles(uniqBy(selectedFiles.concat(files.filter(f => f.fileType !== FileModelType.Directory)), 'id'))
                                        } else {
                                            onSelectFiles(selectedFiles.filter(selectedFile => !files.includes(selectedFile)));
                                        }
                                    }}
                                />
                            )}
                        </TableCell>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Dateigröße</TableCell>
                        {filesAreEditable && <TableCell>&nbsp;</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        files
                            .sort((file1, file2) => {
                                if (file1.fileType !== file2.fileType) {
                                    if (file1.fileType === FileModelType.Directory) {
                                        return -1;
                                    } else {
                                        if (file2.fileType === FileModelType.Directory) {
                                            return 1;
                                        }
                                    }
                                }
                                return file1.filename.localeCompare(file2.filename);
                            })
                            .map(file => (
                                <FileTableRow
                                    key={file.id}
                                    file={file}
                                    isPublic={isPublic}
                                    canEditPublicFiles={canEditPublicFiles}
                                    filesAreEditable={filesAreEditable}
                                    marked={isMarked(file)}
                                    selected={includes<FileModel>(selectedFiles, file)}
                                    onMark={toggleFileMarked(file)}
                                    onSelect={() => {
                                        if (file.fileType === FileModelType.Directory) {
                                            onSelectSubPath(file.filename);
                                        } else {
                                            onSelectFile?.(file);
                                        }
                                    }}
                                    onCheck={onSelectFiles && (checked => {
                                        if (checked && !includes(selectedFiles, file)) {
                                            onSelectFiles(selectedFiles.concat(file));
                                        } else if (!checked) {
                                            onSelectFiles(selectedFiles.filter(f => f.id !== file.id));
                                        }
                                    })}
                                    onEditMenuMove={() => onClickOpenMoveFilesDialog(file)}
                                    onEditMenuDelete={() => onClickDeleteFilesDialog(file)}
                                />
                            ))}
                </TableBody>
            </Table>

        </div>
    );
});