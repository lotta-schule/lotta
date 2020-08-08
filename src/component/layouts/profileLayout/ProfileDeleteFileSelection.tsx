import React, { memo, MouseEvent } from 'react';
import { FileModel } from 'model';
import { Article, Category, File } from 'util/model';
import { makeStyles, Checkbox, Link, Tooltip, TableContainer, Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';

export interface ProfileDeleteFileSelectionProps {
    files: FileModel[];
    selectedFiles: FileModel[];
    onSelectFiles(files: FileModel[]): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        maxHeight: '70vh',
        '& th': {
            backgroundColor: theme.palette.background.default
        }
    },
}));

export const ProfileDeleteFileSelection = memo<ProfileDeleteFileSelectionProps>(({ files, selectedFiles, onSelectFiles }) => {
    const styles = useStyles();

    if (!files?.length) {
        return null;
    }

    const allFilesValue =
        selectedFiles.length === 0 ? 'off' :
        selectedFiles.length === files.length ? 'on' :
        'mixed';

    return (
        <TableContainer className={styles.root}>
            <Table size={'small'} stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Checkbox
                                value={allFilesValue}
                                indeterminate={allFilesValue === 'mixed'}
                                checked={allFilesValue === 'on'}
                                onChange={(_e, checked) => {
                                    onSelectFiles(checked ? [...files] : []);
                                }}
                                inputProps={{ 'aria-label': 'Alle Dateien übergeben' }}
                            />
                        </TableCell>
                        <TableCell>Ordner</TableCell>
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Nutzung</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map(file => {
                        const previewImageUrl = File.getPreviewImageLocation(file);

                        const nameTableCell = (() => {
                            if (previewImageUrl) {
                                return (
                                    <Tooltip style={{ backgroundColor: 'transparent' }} title={(
                                        <img src={previewImageUrl} alt={file.filename} />
                                        )}>
                                        <TableCell scope="row" id={`file-${file.id}-filename`}>
                                            {file.filename}
                                        </TableCell>
                                    </Tooltip>
                                );
                            } else {
                                return (
                                    <TableCell scope="row" id={`file-${file.id}-filename`}>
                                        {file.filename}
                                    </TableCell>
                                );
                            }
                        })();

                        const fileUsageCell = (() => (
                            <TableCell>
                                {file.usage?.filter(u => u.tenant || u.category || u.article).map((usage, i) => {
                                    const linkTarget = (() => {
                                        if (usage.category) {
                                            return Category.getPath(usage.category);
                                        } else if (usage.article) {
                                            return Article.getPath(usage.article);
                                        } else {
                                            return '/';
                                        }
                                    })();
                                    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
                                        e.preventDefault();
                                        window.open(e.currentTarget.href);
                                    };
                                    const linkText = (usage.category ?? usage.article)?.title ?? '[ Logo der Seite ]';
                                    return (
                                        <li key={i}>
                                            <Link color={'secondary'} href={linkTarget} onClick={onClick}>
                                                {linkText}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </TableCell>
                        ))();

                        const isSelected = selectedFiles.findIndex(f => f.id === file.id) > -1;

                        return (
                            <TableRow aria-labelledby={`file-${file.id}-filename`} key={file.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={isSelected}
                                        inputProps={{ 'aria-labelledby': `file-${file.id}-filename` }}
                                        onChange={(_e, checked) => {
                                            if (checked) {
                                                onSelectFiles([...selectedFiles, file]);
                                            } else {
                                                onSelectFiles(selectedFiles.filter(f => f.id !== file.id));
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{file.parentDirectory.name}</TableCell>
                                {nameTableCell}
                                {fileUsageCell}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});
