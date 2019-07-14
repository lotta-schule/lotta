import React, { FunctionComponent, memo, useState } from 'react';
import {
    Edit, Delete, FolderOutlined
} from '@material-ui/icons';
import {
    IconButton, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, TablePagination, makeStyles, Theme, createStyles
} from '@material-ui/core';
import { FileModel, FileModelType } from 'model';
import { FileSize } from 'util/FileSize';

const useStyles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        overlayDropzoneActive: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ccca',
            zIndex: 10000,
            border: '1px solid #333',
            borderRadius: 10,
        }
    }),
);


export interface FileTableProps {
    files: FileModel[];
    onSelectSubPath(path: string): void;
}

export const FileTable: FunctionComponent<FileTableProps> = memo(({ files, onSelectSubPath }) => {

    const [currentPage, setCurrentPage] = useState(0);

    const styles = useStyles();

    return (
        <div>
            <Table size={'small'}>
                <TableHead>
                    <TableRow>
                        <TableCell>{/*actions*/}</TableCell>
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Dateigröße</TableCell>
                        <TableCell>Dateityp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        files
                            .slice(currentPage * 10, currentPage * 10 + 10)
                            .map((file: FileModel) => (
                                file.fileType === FileModelType.Directory ? (
                                    // directory
                                    <TableRow hover key={file.id} onClick={() => onSelectSubPath(file.filename)}>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <FolderOutlined style={{ top: 5, position: 'relative', right: 10 }} />
                                            {file.filename}
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ) : (
                                        <TableRow hover key={file.id} >
                                            <TableCell>
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
                                            </TableCell>
                                            <TableCell component="th" scope="row" padding="none">
                                                {file.filename}
                                            </TableCell>
                                            <TableCell align="right">{new FileSize(file.filesize).humanize()}</TableCell>
                                            <TableCell align="right">{file.fileType}</TableCell>
                                        </TableRow>
                                    )
                            ))}
                </TableBody>
            </Table>

            <TablePagination
                component="div"
                count={(files || []).length}
                rowsPerPage={10}
                page={currentPage}
                backIconButtonProps={{
                    'aria-label': 'Vorherige Seite',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Nächste Seite',
                }}
                onChangePage={(e, page) => setCurrentPage(page)}
            />
        </div>
    );
});