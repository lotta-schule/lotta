import * as React from 'react';
import {
    Tooltip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@material-ui/core';
import { FileModel } from 'model';
import { Article, Category, File } from 'util/model';
import { Checkbox } from 'component/general/form/checkbox';
import { useServerData } from 'component/ServerDataContext';
import Link from 'next/link';

import styles from './ProfileDeleteFileSelection.module.scss';

export interface ProfileDeleteFileSelectionProps {
    files: FileModel[];
    selectedFiles: FileModel[];
    onSelectFiles(files: FileModel[]): void;
}

export const ProfileDeleteFileSelection =
    React.memo<ProfileDeleteFileSelectionProps>(
        ({ files, selectedFiles, onSelectFiles }) => {
            const { baseUrl } = useServerData();
            if (!files?.length) {
                return null;
            }

            const allFilesValue =
                selectedFiles.length === 0
                    ? 'off'
                    : selectedFiles.length === files.length
                    ? 'on'
                    : 'mixed';

            return (
                <TableContainer className={styles.root}>
                    <Table size={'small'} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        label={''}
                                        value={allFilesValue}
                                        checked={allFilesValue === 'on'}
                                        onChange={(e) => {
                                            onSelectFiles(
                                                e.currentTarget.checked
                                                    ? [...files]
                                                    : []
                                            );
                                        }}
                                        aria-label={'Alle Dateien übergeben'}
                                    />
                                </TableCell>
                                <TableCell>Ordner</TableCell>
                                <TableCell>Dateiname</TableCell>
                                <TableCell>Nutzung</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.map((file) => {
                                const previewImageUrl =
                                    File.getPreviewImageLocation(baseUrl, file);

                                const nameTableCell = (() => {
                                    if (previewImageUrl) {
                                        return (
                                            <Tooltip
                                                style={{
                                                    backgroundColor:
                                                        'transparent',
                                                }}
                                                title={
                                                    <img
                                                        src={previewImageUrl}
                                                        alt={file.filename}
                                                    />
                                                }
                                            >
                                                <TableCell
                                                    scope="row"
                                                    id={`file-${file.id}-filename`}
                                                >
                                                    {file.filename}
                                                </TableCell>
                                            </Tooltip>
                                        );
                                    } else {
                                        return (
                                            <TableCell
                                                scope="row"
                                                id={`file-${file.id}-filename`}
                                            >
                                                {file.filename}
                                            </TableCell>
                                        );
                                    }
                                })();

                                const fileUsageCell = (() => (
                                    <TableCell>
                                        {file.usage
                                            ?.filter(
                                                (u) => u.category || u.article
                                            )
                                            .map((usage, i) => {
                                                const linkTarget = (() => {
                                                    if (usage.category) {
                                                        return Category.getPath(
                                                            usage.category
                                                        );
                                                    } else if (usage.article) {
                                                        return Article.getPath(
                                                            usage.article
                                                        );
                                                    } else {
                                                        return '/';
                                                    }
                                                })();
                                                const linkText =
                                                    (
                                                        usage.category ??
                                                        usage.article
                                                    )?.title ??
                                                    '[ Logo der Seite ]';
                                                return (
                                                    <li key={i}>
                                                        <Link
                                                            href={linkTarget}
                                                            passHref
                                                        >
                                                            <a
                                                                target={
                                                                    '_blank'
                                                                }
                                                            >
                                                                {linkText}
                                                            </a>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                    </TableCell>
                                ))();

                                const isSelected =
                                    selectedFiles.findIndex(
                                        (f) => f.id === file.id
                                    ) > -1;

                                return (
                                    <TableRow
                                        aria-labelledby={`file-${file.id}-filename`}
                                        key={file.id}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                label={''}
                                                checked={isSelected}
                                                aria-labelledby={`file-${file.id}-filename`}
                                                onChange={(e) => {
                                                    if (
                                                        e.currentTarget.checked
                                                    ) {
                                                        onSelectFiles([
                                                            ...selectedFiles,
                                                            file,
                                                        ]);
                                                    } else {
                                                        onSelectFiles(
                                                            selectedFiles.filter(
                                                                (f) =>
                                                                    f.id !==
                                                                    file.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {file.parentDirectory.name}
                                        </TableCell>
                                        {nameTableCell}
                                        {fileUsageCell}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    );
ProfileDeleteFileSelection.displayName = 'ProfileDeleteFileSelection';
