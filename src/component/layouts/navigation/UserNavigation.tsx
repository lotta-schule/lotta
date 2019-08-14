import React, { FunctionComponent, memo, useState, useCallback } from 'react';
import { Grid, Typography, Link, makeStyles, Button, Badge, withStyles } from '@material-ui/core';
import { UserModel } from '../../../model';
import { CollisionLink } from '../../general/CollisionLink';
import { LoginDialog } from '../../dialog/LoginDialog';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { useDispatch } from 'react-redux';
import useRouter from 'use-react-router';
import { createAddArticleAction } from 'store/actions/content';
import { Add as AddCircleIcon, } from '@material-ui/icons';
import classNames from 'classnames';
import { createLoginAction, createLogoutAction } from 'store/actions/user';
import { createCloseDrawerAction } from 'store/actions/layout';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { CurrentUserAvatar } from 'component/user/UserAvatar';

const useStyles = makeStyles(theme => ({
    root: {
        top: (theme.mixins.toolbar.minHeight as number) + theme.spacing(2),
        backgroundColor: '#fff',
        padding: '0.5em 1em 0.5em 0.5em',
        borderLeftWidth: 5,
        borderLeftColor: theme.palette.primary.main,
        borderLeftStyle: 'solid',
        height: 138,
    },
    button: {
        marginTop: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
}));

const StyledBadge = withStyles(theme => ({
    badge: {
      top: '45%',
      right: 80,
    },
  }))(Badge);
  

export const UserNavigation: FunctionComponent<{}> = memo(() => {
    const styles = useStyles();

    const currentUser = useCurrentUser();

    const dispatch = useDispatch();
    const onLogin = useCallback((user: UserModel, token: string) => {
        dispatch(createLoginAction(user, token))
        dispatch(createCloseDrawerAction());
    }, [dispatch]);
    const onLogout = useCallback(() => {
        dispatch(createLogoutAction());
        dispatch(createCloseDrawerAction());
    }, [dispatch]);

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    const { history } = useRouter();

    return (
        <>
            <Grid container justify={'space-evenly'} className={styles.root}>
                <Grid item xs={6} style={{ display: 'flex' }}>
                    {currentUser && (
                        <div>
                            <CurrentUserAvatar />
                            <Typography variant={'body2'} align={'center'}>
                                {User.getNickname(currentUser)}
                            </Typography>
                        </div>
                    )}
                </Grid>
                <Grid item xs={6} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                    <Typography variant={'body2'} component={'nav'} align={'right'}>
                        <ul>
                            {currentUser ?
                                <li><Link onClick={() => onLogout()}>Abmelden</Link></li> :
                                <>
                                    <li><Link onClick={() => setLoginModalIsOpen(true)}>Anmelden</Link></li>
                                </>
                            }
                            {currentUser && (
                                <>
                                    <li><Link component={CollisionLink} to={'/profile'}>
                                            <StyledBadge badgeContent={4} color="secondary">
                                             Mein Profil
                                            </StyledBadge>
                                        </Link></li>
                                    <li><Link component={CollisionLink} to={'/admin'}>Administration</Link></li>
                                </>
                            )}
                            <li>Impressum</li>
                            <li>Datenschutz</li>
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
            {currentUser && (
                <>
                    <Button size="small" variant="contained" color="secondary" className={styles.button} onClick={() => setCreateArticleModalIsOpen(true)}>
                        <AddCircleIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                        Neuer Beitrag
                </Button>
                </>
            )}
            <CreateArticleDialog
                isOpen={createArticleModalIsOpen}
                onAbort={() => setCreateArticleModalIsOpen(false)}
                onConfirm={article => {
                    dispatch(createAddArticleAction(article));
                    history.push(`/article/${article.id}`);
                }}
            />
            <LoginDialog
                isOpen={loginModalIsOpen}
                onAbort={() => setLoginModalIsOpen(false)}
                onLogin={(user, token) => {
                    setLoginModalIsOpen(false);
                    onLogin(user, token);
                }}
            />
        </>
    );
});