import React, { FunctionComponent, memo } from 'react';
import {
    Edit, Delete, FolderOutlined
} from '@material-ui/icons';
import {
    IconButton, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, makeStyles, Theme
} from '@material-ui/core';
import { FileModel, FileModelType } from 'model';
import { FileSize } from 'util/FileSize';

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
                flexDirection: 'row',
                alignItems: 'center'
            }
        }
    },
    actionButton: {
        height: 24,
        width: 24,
        padding: 0
    }
}));


export interface FileTableProps {
    files: FileModel[];
    disableEditColumn?: boolean;
    onSelectSubPath(path: string): void;
    onSelectFile?(file: FileModel): void;
}

export const FileTable: FunctionComponent<FileTableProps> = memo(({ files, disableEditColumn, onSelectSubPath, onSelectFile }) => {

    const styles = useStyles();

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
                                    <TableRow hover key={file.id} onClick={() => onSelectSubPath(file.filename)}>
                                        {!disableEditColumn && (<TableCell></TableCell>)}
                                        <TableCell>
                                            <FolderOutlined style={{ position: 'relative', right: 10 }} />
                                            {file.filename}
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ) : (
                                        <TableRow hover key={file.id} onClick={() => onSelectFile && onSelectFile(file)}>
                                            <TableCell>
                                                {!disableEditColumn && (
                                                    <>
                                                        <Tooltip title="Dateiname bearbeiten">
                                                            <IconButton className={styles.actionButton} aria-label="Dateiname bearbeiten" onClick={() => { }}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Datei löschen">
                                                            <IconButton className={styles.actionButton} aria-label="Datei löschen" onClick={() => { }}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell scope="row" padding="none">
                                                {file.filename}
                                            </TableCell>
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