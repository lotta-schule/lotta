// margin: 0 0 .5em;

import React, { FunctionComponent, memo, useCallback } from 'react';
import { Grid, makeStyles, IconButton, Avatar, Typography } from '@material-ui/core';
import { UserModel } from '../../../model';
import { useSelector, useDispatch } from 'react-redux';
import { Menu } from '@material-ui/icons';
import { State } from 'store/State';
import { createOpenDrawerAction } from 'store/actions/layout';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { useCategories } from 'util/categories/useCategories';
import { theme } from 'theme';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        height: 64,
        zIndex: 1,
        top: 100,
        right: 0,
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '-3px 0px 7px #00000063',
        [theme.breakpoints.down('xs')]: {
            height: 56,
        },
    },
}));

export const UserNavigationMobile: FunctionComponent = memo(() => {
    const styles = useStyles();
    const user = useSelector<State, UserModel | null>(s => s.user.user);
    const dispatch = useDispatch();
    const openDrawer = useCallback(() => { dispatch(createOpenDrawerAction()); }, [dispatch]);
    const categories = useCategories();
    const currentCategoryId = useCurrentCategoryId();
    const subcategories = (categories || []).filter(category => category.category && category.category.id === currentCategoryId);

    return (
        <Grid container alignItems={'center'} className={styles.root} item sm={1} xs={2}>
            <IconButton size={'small'} onClick={() => openDrawer()} style={{ margin: '0 auto' }} >
                <Menu style={{ color: '#fff', }} />
            </IconButton>
        </Grid>
    );
});