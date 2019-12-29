import React, { MouseEvent, memo, useState, useCallback } from 'react';
import { TableRow, TableCell, Checkbox, IconButton, Menu, MenuItem, Divider } from '@material-ui/core';
import { MoreVert, FileCopyOutlined, DeleteOutlineOutlined, FolderSharedOutlined, PublicOutlined, CreateOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/react-hooks';
import { FileModel, FileModelType } from 'model';
import { File } from 'util/model/File';
import { FileSize } from 'util/FileSize';
import { MoveFileMutation } from 'api/mutation/MoveFileMutation';
import { FileTableRowFilenameCell } from './FileTableRowFilenameCell';
import clsx from 'clsx';

export interface FileTableRowProps {
    file: FileModel;
    marked: boolean;
    selected: boolean;
    isPublic: boolean;
    filesAreEditable?: boolean;
    canEditPublicFiles?: boolean;
    onSelect(): void;
    onMark(e: MouseEvent): void;
    onCheck?(checked: boolean): void;
    onEditMenuMove(): void;
    onEditMenuDelete(): void;
}

export const FileTableRow = memo<FileTableRowProps>(({ file, marked, selected, isPublic, filesAreEditable, canEditPublicFiles, onMark, onSelect, onCheck, onEditMenuMove, onEditMenuDelete }) => {
    const [editMenuAnchorEl, setEditMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [isRenamingFile, setIsRenamingFile] = useState(false);

    const isDirectory = file.fileType === FileModelType.Directory;

    const handleEditMenuClose = () => {
        setEditMenuAnchorEl(null);
    }

    const [moveFile] = useMutation(MoveFileMutation, {
        onCompleted: () => setEditMenuAnchorEl(null)
    });

    const handleEditMenuClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEditMenuAnchorEl(event.currentTarget);
    }, []);

    const handleEditMenuClickRename = useCallback((event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setEditMenuAnchorEl(null);
        setIsRenamingFile(true);
    }, []);

    return (
        <TableRow
            key={file.id}
            hover
            className={clsx({ selected: marked })}
            onClick={filesAreEditable ? onMark : undefined}
        >
            <TableCell>
                {(!isDirectory && onCheck) && (
                    <Checkbox
                        checked={selected}
                        onChange={(e, checked) => onCheck(checked)}
                    />
                )}
            </TableCell>
            <TableCell>{File.getIconForFile(file)}</TableCell>
            <FileTableRowFilenameCell file={file} isRenaming={isRenamingFile} onCompleteRenaming={() => setIsRenamingFile(false)} onSelect={onSelect} />
            <TableCell align="right">
                {isDirectory && <>&nbsp;</>}
                {!isDirectory && new FileSize(file.filesize).humanize()}
            </TableCell>
            {filesAreEditable && (
                <TableCell>
                    <IconButton aria-label="delete" size="small" onClick={handleEditMenuClick}>
                        <MoreVert fontSize="inherit" />
                    </IconButton>
                    <Menu
                        anchorEl={editMenuAnchorEl}
                        open={Boolean(editMenuAnchorEl)}
                        onClose={() => handleEditMenuClose()}
                    >
                        {[
                            <MenuItem key={'rename'} onClick={(e) => handleEditMenuClickRename(e)}><CreateOutlined color={'secondary'} />&nbsp;Umbenennen</MenuItem>,
                            ...(!isDirectory ? [
                                <MenuItem key={'del'} onClick={() => onEditMenuDelete()}><DeleteOutlineOutlined color={'secondary'} />&nbsp;Löschen</MenuItem>,
                                <MenuItem key={'move'} onClick={() => onEditMenuMove()}><FileCopyOutlined color={'secondary'} />&nbsp;Verschieben</MenuItem>
                            ] : []),
                            ...(!isDirectory && canEditPublicFiles ? [
                                <Divider key={'divider1'} />,
                                isPublic ? (
                                    <MenuItem key={'movePrivate'} onClick={() => moveFile({ variables: { id: file.id, isPublic: false } })}>
                                        <FolderSharedOutlined color={'secondary'} />&nbsp;zu eigenen Dateien verschieben
                                    </MenuItem>
                                ) : (
                                        <MenuItem key={'movePublic'} onClick={() => moveFile({ variables: { id: file.id, isPublic: true } })}>
                                            <PublicOutlined color={'secondary'} />&nbsp;zu schulweiten Dateien verschieben
                                        </MenuItem>
                                    )
                            ] : [])
                        ]}
                    </Menu>
                </TableCell>
            )}
        </TableRow >
    );
});