// margin: 0 0 .5em;

import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles, IconButton, Avatar } from '@material-ui/core';
import { UserModel } from '../../../model';
import { useSelector } from 'react-redux';
import { Menu } from '@material-ui/icons';
import { State } from 'store/State';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        padding: `0 ${theme.spacing(2)}px`,
        marginBottom: '.5em'
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

export interface UserNavigationMobileProps {
    onToggleMenu(): void;
}

export const UserNavigationMobile: FunctionComponent<UserNavigationMobileProps> = memo(({ onToggleMenu }) => {
    const styles = useStyles();
    const user = useSelector<State, UserModel | null>(s => s.user.user);

    return (
        <Grid container alignItems={'center'} className={styles.root}>
            <Grid item xs={10} className={styles.userGridItem}>
                {user && (
                    <>
                        <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/${user.email}.svg`} />
                        <span>{user.nickname || user.name}</span>
                    </>
                )}
            </Grid>
            <Grid item xs className={styles.buttonGridItem}>
                <IconButton size={'small'} onClick={() => onToggleMenu()}>
                    <Menu />
                </IconButton>
            </Grid>
        </Grid>
    );
});