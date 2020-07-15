import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { FileTable } from './FileTable';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        overflow: 'auto'
    }
}));

export const FilesView = memo(() => {
    const styles = useStyles();
    return (
        <section className={styles.root}>
            <FileTable />
            <Sidebar />
        </section>
    );
});
