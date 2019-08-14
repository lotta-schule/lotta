import React, { FunctionComponent, memo, useCallback } from 'react';
import {
    Edit, Delete, FolderOutlined
} from '@material-ui/icons';
import {
    IconButton, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, makeStyles, Theme, Checkbox
} from '@material-ui/core';
import { FileModel, FileModelType } from 'model';
import { FileSize } from 'util/FileSize';
import { find, includes } from 'lodash';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
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
            height: 600
        },
        '& tr': {
            display: 'flex',
            width: '100%',
            flexShrink: 0,
            boxSizing: 'border-box',
            '& > td, & > th': {
                '&:nth-child(1)': {
                    width: '10%'
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
    onSelectSubPath(path: string): void;
    onSelectFile?(file: FileModel): void;
    onSelectFiles?(files: FileModel[]): void;
}

export const FileTable: FunctionComponent<FileTableProps> = memo(({ files, selectedFiles, onSelectSubPath, onSelectFile, onSelectFiles }) => {

    const styles = useStyles();

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
            <TableCell scope="row" padding="none">
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
    }, [styles.tooltip]);

    return (
        <div>
            <Table size={'small'} className={styles.root}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            {/*actions*/}
                        </TableCell>
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Dateigröße</TableCell>
                        <TableCell>Dateityp</TableCell>
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
                                    <TableRow hover key={file.id} onClick={() => onSelectSubPath(file.filename)} style={{ cursor: 'pointer', }}>
                                        {<TableCell></TableCell>}
                                        <TableCell>
                                            <FolderOutlined style={{ position: 'relative', marginRight: 10 }} />
                                            {file.filename}
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ) : (
                                        <TableRow
                                            key={file.id}
                                            hover
                                            style={{ cursor: onSelectFile ? 'pointer' : 'default' }}
                                            onClick={() => onSelectFile && onSelectFile(file)}
                                        >
                                            <TableCell>
                                                {!onSelectFiles && !onSelectFile && (
                                                    <>
                                                        <Tooltip title="Dateiname bearbeiten">
                                                            <IconButton disabled className={styles.actionButton} aria-label="Dateiname bearbeiten" onClick={() => { }}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Datei löschen">
                                                            <IconButton className={styles.actionButton} aria-label="Datei löschen" onClick={() => { }}>
                                                                <Delete color="secondary"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {onSelectFiles && (
                                                    <Checkbox
                                                        checked={includes<FileModel>(selectedFiles, file)}
                                                        onChange={(_, checked) => {
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
                                        </TableRow>
                                    )
                            ))}
                </TableBody>
            </Table>
        </div>
    );
});