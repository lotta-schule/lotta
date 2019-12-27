import React, { memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions, Tooltip, IconButton } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import { ArrowDropDown, ArrowRight, CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/react-hooks';
import { uniq } from 'lodash';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { useFileExplorerData } from './context/useFileExplorerData';
import { MoveFileMutation } from 'api/mutation/MoveFileMutation';
import { CreateNewFolderDialog } from './CreateNewFolderDialog';

export const SelectDirectoryTreeDialog = memo(() => {
    const [state, dispatch] = useFileExplorerData();
    const [path, setPath] = useState(state.currentPath);
    const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);

    const [moveFile] = useMutation(MoveFileMutation);

    const getDirNameForPath = (path: string) => {
        if (path === '/') {
            return path;
        }
        const splitted = path.split('/');
        return splitted[splitted.length - 1];
    };

    const getDirsForPath = (rootDir: string) => {
        return uniq(
            state.files
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
        <ResponsiveFullScreenDialog open={state.showMoveFiles} onClose={() => dispatch({ type: 'hideMoveFiles' })} aria-labelledby="select-directory-tree-dialog">
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
                >
                    <TreeItem nodeId={'/'} label={'Medien'} onClick={() => setPath('/')}>
                        {getTreeItems('/')}
                    </TreeItem>
                </TreeView>
                <CreateNewFolderDialog
                    basePath={path}
                    isPublic={state.isPublic}
                    open={isCreateNewFolderDialogOpen}
                    onClose={() => setIsCreateNewFolderDialogOpen(false)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={() => dispatch({ type: 'hideMoveFiles' })}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => {
                        state.markedFiles.forEach(file => moveFile({ variables: { id: file.id, path } }));
                        dispatch({ type: 'hideMoveFiles' });
                    }}
                >
                    Dateien verschieben
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});