import React, { memo } from 'react';
import { ContentModuleModel, FileModel } from '../../../../model';
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Link } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { FileSize } from 'util/FileSize';

interface ShowProps {
    contentModule: ContentModuleModel;
    onRemoveFile?(file: FileModel): void;
}

export const Show = memo<ShowProps>(({ contentModule, onRemoveFile }) => {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Datei</TableCell>
                    <TableCell align="right">Dateigröße</TableCell>
                    <TableCell align="right"></TableCell>
                    {onRemoveFile && (
                        <TableCell align="right"></TableCell>
                    )}
                    {/* {!onRemoveFile && (
                        <TableCell align={'right'}></TableCell>
                    )} */}
                </TableRow>
            </TableHead>
            <TableBody>
                {contentModule.files.map(file => (
                    <TableRow key={file.id}>
                        <TableCell component="th" scope="row">
                            <Link href={file.remoteLocation} target={'_blank'}>{file.filename}</Link>
                        </TableCell>
                        <TableCell align="right">{new FileSize(file.filesize).humanize()}</TableCell>
                        <TableCell align="right"></TableCell>
                        {onRemoveFile && (
                            <TableCell align="right">
                                <Tooltip title={'Datei löschen'}>
                                    <IconButton onClick={() => onRemoveFile(file)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        )}
                        {/* {!onRemoveFile && (
                            <TableCell align={'right'}>
                                <Button component={Link} href={file.remoteLocation} download={file.filename} title={'Download'} target={'_blank'}>
                                    <CloudDownloadOutlined />
                                </Button>
                            </TableCell>
                        )} */}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
});