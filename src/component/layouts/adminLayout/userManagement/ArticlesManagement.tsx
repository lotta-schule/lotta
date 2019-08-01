
import React, { FunctionComponent, memo } from 'react';
import {
    makeStyles, Theme
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    root: {

    }
}));

export const ArticlesManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            Meine Artikel
        </div>
    );
});