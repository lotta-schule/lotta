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

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#fff',
        padding: `0 ${theme.spacing(2)}px`,
        marginBottom: '.5em',
        position: 'sticky',
        boxShadow: '0px 2px 2px #00000061',
        [theme.breakpoints.up('sm')]: {
            top: '6.5em',
        },
    },
    userGridItem: {
        display: 'flex',
        alignItems: 'center'
    },
    buttonGridItem: {
        textAlign: 'right'
    },
    avatar: {
        height: '1.5em',
        width: '1.5em',
        margin: '.25em .5em .25em 0',
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
        <Grid container alignItems={'center'} className={styles.root} style={{ top: subcategories.length ? '6em' : '3.5em' }}>
            <Grid item xs={10} className={styles.userGridItem}>
                {user && (
                    <>
                        <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/${user.email}.svg`} />
                        <Typography variant={'body1'}>{user.nickname || user.name}</Typography>
                    </>
                )}
            </Grid>
            <Grid item xs className={styles.buttonGridItem}>
                <IconButton size={'small'} onClick={() => openDrawer()}>
                    <Menu />
                </IconButton>
            </Grid>
        </Grid>
    );
});