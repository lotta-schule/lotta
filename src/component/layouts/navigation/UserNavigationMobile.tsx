// margin: 0 0 .5em;

import React, { FunctionComponent, memo, useCallback } from 'react';
import { Grid, makeStyles, IconButton, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { Menu } from '@material-ui/icons';
import { createOpenDrawerAction } from 'store/actions/layout';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { useCategories } from 'util/categories/useCategories';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { CurrentUserAvatar } from 'component/user/UserAvatar';

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

    const currentUser = useCurrentUser();

    const dispatch = useDispatch();

    const openDrawer = useCallback(() => { dispatch(createOpenDrawerAction()); }, [dispatch]);
    const categories = useCategories();
    const currentCategoryId = useCurrentCategoryId();
    const subcategories = (categories || []).filter(category => category.category && category.category.id === currentCategoryId);

    return (
        <Grid container alignItems={'center'} className={styles.root} style={{ top: subcategories.length ? '6em' : '3.5em' }}>
            <Grid item xs={10}>
                {currentUser && (
                    <>
                        <CurrentUserAvatar />
                        <Typography variant={'body1'}>{User.getNickname(currentUser)}</Typography>
                    </>
                )}
            </Grid>
            <Grid item xs>
                <IconButton size={'small'} onClick={() => openDrawer()}>
                    <Menu />
                </IconButton>
            </Grid>
        </Grid>
    );
});