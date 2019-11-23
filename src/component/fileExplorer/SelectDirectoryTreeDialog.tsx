import React, { memo, useState } from 'react';
import { uniq } from 'lodash';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions, Tooltip, IconButton } from '@material-ui/core';
import { CreateNewFolderDialog } from './CreateNewFolderDialog';
import { TreeView, TreeItem } from '@material-ui/lab';
import { ArrowDropDown, ArrowRight, CreateNewFolderOutlined } from '@material-ui/icons';
import { FileModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

export interface SelectDirectoryTreeDialogProps {
    basePath: string;
    open: boolean;
    allFiles: FileModel[];
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
    onConfirm(newPath: string): void;
}

export const SelectDirectoryTreeDialog = memo<SelectDirectoryTreeDialogProps>(({ basePath, open, allFiles, onClose, onConfirm }) => {
    const [path, setPath] = useState(basePath);
    const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);

    const getDirNameForPath = (path: string) => {
        if (path === '/') {
            return path;
        }
        const splitted = path.split('/');
        return splitted[splitted.length - 1];
    };

    const getDirsForPath = (rootDir: string) => {
        return uniq(
            allFiles
                .map(f => f.path)
                .filter(path => new RegExp(`^${rootDir}`).test(path))
                .map(path => path.replace(new RegExp(`^${rootDir}`), ''))
                .map(path => path.replace(/^\//, ''))
                .filter(Boolean)
                .map(path => rootDir === '/' ? `/${path.split('/')[0]}` : ([rootDir, path.split('/')[0]]).join('/'))
        );
    }

    const getTreeItems = (path: string) => {
        return getDirsForPath(path).map(treePath => {
            return (
                <TreeItem key={treePath} nodeId={treePath} label={getDirNameForPath(treePath)} onClick={() => setPath(treePath)}>
                    {getTreeItems(treePath)}
                </TreeItem>
            );
        });
    }

    return (
        <ResponsiveFullScreenDialog open={open} onClose={onClose} aria-labelledby="select-directory-tree-dialog">
            <DialogTitle id="select-directory-tree-dialog-title">Dateien verschieben</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Wähle ein Zielort
                </DialogContentText>
                <Tooltip title="Ordner erstellen">
                    <IconButton aria-label="Ordner erstellen" onClick={() => setIsCreateNewFolderDialogOpen(true)}>
                        <CreateNewFolderOutlined color={'secondary'} />
                    </IconButton>
                </Tooltip>
                <TreeView
                    defaultExpanded={['/']}
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    onNodeToggle={(nodeId, isExpanded) => {
                        console.log(`${nodeId} is ${isExpanded ? 'expanded' : 'not expanded'}`);
                    }}
                >
                    <TreeItem nodeId={'/'} label={'Medien'} onClick={() => setPath('/')}>
                        {getTreeItems('/')}
                    </TreeItem>
                </TreeView>
                <CreateNewFolderDialog
                    basePath={path}
                    open={isCreateNewFolderDialogOpen}
                    onClose={() => setIsCreateNewFolderDialogOpen(false)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={e => onClose(e, 'auto')}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => onConfirm(path)}
                >
                    Dateien verschieben
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});