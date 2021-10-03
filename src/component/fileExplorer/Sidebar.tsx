import * as React from 'react';
import { FileDetailView } from './FileDetailView';
import fileExplorerContext from './context/FileExplorerContext';
import clsx from 'clsx';

import styles from './Sidebar.module.scss';

export const Sidebar = React.memo(() => {
    const [{ markedFiles, detailSidebarEnabled }] =
        React.useContext(fileExplorerContext);
    const isActive = detailSidebarEnabled && markedFiles.length === 1;

    return (
        <div className={clsx(styles.root, { [styles.isActive]: isActive })}>
            {isActive && markedFiles[0] && (
                <FileDetailView file={markedFiles[0]} />
            )}
        </div>
    );
});
Sidebar.displayName = 'Sidebar';
