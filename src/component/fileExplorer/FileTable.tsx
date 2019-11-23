import React, { MouseEvent, memo, useCallback, useState, useEffect } from 'react';
import { findIndex, range } from 'lodash';
import {
    FolderOutlined, MoreVert, FileCopyOutlined, DeleteOutlineOutlined
} from '@material-ui/icons';
import {
    Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Theme, Checkbox, IconButton, Menu, MenuItem
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FileModel, FileModelType, ID } from 'model';
import { FileSize } from 'util/FileSize';
import { find, includes, some, every, uniqBy } from 'lodash';
import clsx from 'clsx';

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
                '&:nth-child(1)': {
                    width: '10%',
                    display: ({ filesAreEditable }) => filesAreEditable ? 'none' : 'initial'
                },
                '&:nth-child(2)': {
                    width: '50%'
                },
                '&:nth-child(3)': {
                    width: '20%'
                },
                '&:nth-child(4)': {
                    width: '20%'
                },
                '&:nth-child(5)': {
                    width: '10%'
                },
            },
            '& > td': {
                display: 'flex',
                boxSizing: 'border-box',
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexGrow: 0,
                flexShrink: 0,
                padding: 6
            }
        }
    },
    actionButton: {
        height: 24,
        width: 24,
        padding: 0
    },
    tooltip: {
        backgroundColor: 'transparent'
    }
}));

export interface FileTableProps {
    files: FileModel[];
    selectedFiles: FileModel[];
    markedFileIds: ID[];
    setMarkedFileIds(ids: ID[]): void;
    onSelectSubPath(path: string): void;
    onClickOpenMoveFilesDialog(file: FileModel): void;
    onClickDeleteFilesDialog(file: FileModel): void;
    onSelectFile?(file: FileModel): void;
    onSelectFiles?(files: FileModel[]): void;
}

export const FileTable = memo<FileTableProps>(({
    files, selectedFiles, markedFileIds, setMarkedFileIds, onSelectSubPath, onSelectFile, onSelectFiles, onClickOpenMoveFilesDialog, onClickDeleteFilesDialog
}) => {
    const filesAreEditable = !onSelectFile && !onSelectFiles;
    const styles = useStyles({ filesAreEditable });

    const [fileForOpenMenu, setFileForOpenMenu] = useState<null | FileModel>(null);
    const [editMenuAnchorEl, setEditMenuAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleEditMenuClick = (file: FileModel) => (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setFileForOpenMenu(file);
        setEditMenuAnchorEl(event.currentTarget);
    };

    const handleEditMenuClose = () => {
        setFileForOpenMenu(null);
        setEditMenuAnchorEl(null);
    }

    const handleEditMenuMove = () => {
        onClickOpenMoveFilesDialog(fileForOpenMenu!);
    };

    const handleEditMenuDelete = () => {
        onClickDeleteFilesDialog(fileForOpenMenu!);
    };

    useEffect(() => {
        handleEditMenuClose();
    }, [markedFileIds]);

    const getFilenameCell = useCallback((file: FileModel) => {
        let previewImageUrl: string | null = null;
        if (file.fileType === FileModelType.Image) {
            previewImageUrl = file.remoteLocation;
        } else {
            const imageConversionFile = file.fileConversions &&
                file.fileConversions.length > 0 &&
                find(file.fileConversions, fc => /^storyboard/.test(fc.format));
            if (imageConversionFile) {
                previewImageUrl = imageConversionFile.remoteLocation;
            }
        }

        const tableCell = (
            <TableCell scope="row" padding="none" onClick={() => onSelectFile && onSelectFile(file)}>
                {file.filename}
            </TableCell>
        );

        if (previewImageUrl) {
            return (
                <Tooltip className={styles.tooltip} title={(
                    <img
                        src={`https://afdptjdxen.cloudimg.io/bound/200x200/foil1/${previewImageUrl}`}
                        alt={file.filename}
                    />
                )}>
                    {tableCell}
                </Tooltip>
            );
        } else {
            return tableCell;
        }
    }, [onSelectFile, styles.tooltip]);

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
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Dateigröße</TableCell>
                        <TableCell>Dateityp</TableCell>
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
                            .map((file: FileModel) => (
                                file.fileType === FileModelType.Directory ? (
                                    // directory
                                    <TableRow
                                        key={file.id}
                                        hover
                                        className={clsx({ selected: isMarked(file) })}
                                    >
                                        <TableCell></TableCell>
                                        <TableCell
                                            onClick={e => {
                                                e.preventDefault();
                                                onSelectSubPath(file.filename);
                                            }}
                                        >
                                            <FolderOutlined style={{ position: 'relative', marginRight: 10 }} />
                                            {file.filename}
                                        </TableCell>
                                        <TableCell>&nbsp;</TableCell>
                                        <TableCell>&nbsp;</TableCell>
                                        {filesAreEditable && (
                                            <TableCell>&nbsp;</TableCell>
                                        )}
                                    </TableRow>
                                ) : (
                                        <TableRow
                                            key={file.id}
                                            hover
                                            className={clsx({ selected: isMarked(file) })}
                                            onClick={filesAreEditable ? toggleFileMarked(file) : undefined}
                                        >
                                            <TableCell>
                                                {onSelectFiles && (
                                                    <Checkbox
                                                        checked={includes<FileModel>(selectedFiles, file)}
                                                        onChange={(e, checked) => {
                                                            e.preventDefault();
                                                            if (checked && !includes(selectedFiles, file)) {
                                                                onSelectFiles(selectedFiles.concat(file));
                                                            } else if (!checked) {
                                                                onSelectFiles(selectedFiles.filter(f => f.id !== file.id));
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                            {getFilenameCell(file)}
                                            <TableCell align="right">{new FileSize(file.filesize).humanize()}</TableCell>
                                            <TableCell align="right">{file.fileType}</TableCell>
                                            {filesAreEditable && (
                                                <TableCell>
                                                    <IconButton aria-label="delete" size="small" onClick={handleEditMenuClick(file)}>
                                                        <MoreVert fontSize="inherit" />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                            ))}
                </TableBody>
            </Table>
            <Menu
                anchorEl={editMenuAnchorEl}
                keepMounted
                open={Boolean(editMenuAnchorEl)}
                onClose={handleEditMenuClose}
            >
                <MenuItem onClick={handleEditMenuMove}><FileCopyOutlined color={'secondary'} />&nbsp;Verschieben</MenuItem>
                <MenuItem onClick={handleEditMenuDelete}><DeleteOutlineOutlined color={'secondary'} />&nbsp;Löschen</MenuItem>
            </Menu>
        </div>
    );
});