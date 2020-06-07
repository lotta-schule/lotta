import React, { memo, useContext } from 'react';
import { Theme, makeStyles } from '@material-ui/core';
import { FileDetailView } from './FileDetailView';
import fileExplorerContext from './context/FileExplorerContext';

const useStyles = makeStyles<Theme, { isActive: boolean }>(theme => ({
    root: {
        transition: 'width ease-in 150ms, border-color ease-in 150ms, padding linear 50ms',
        padding: ({ isActive }) => theme.spacing(isActive ? 1 : 0),
        width: ({ isActive }) => isActive ? '30%' : 0,
        borderLeftColor: ({ isActive }) => isActive ? theme.palette.divider : 'transparent',
        borderLeftWidth: 1,
        borderLeftStyle: 'dotted'
    },
}));

export const Sidebar = memo(() => {
    const [{ markedFiles, detailSidebarEnabled }] = useContext(fileExplorerContext);
    const isActive = detailSidebarEnabled && markedFiles.length === 1;
    const styles = useStyles({ isActive });

    return (
        <div className={styles.root}>
            {isActive && markedFiles[0] && (
                <FileDetailView file={markedFiles[0]} />
            )}
        </div>
    );
});
