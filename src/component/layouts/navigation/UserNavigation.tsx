import React, { FunctionComponent, memo, useState, useCallback } from 'react';
import { Grid, Typography, Avatar, Link, makeStyles, Button } from '@material-ui/core';
import { UserModel } from '../../../model';
import { CollisionLink } from '../../general/CollisionLink';
import { LoginDialog } from '../../dialog/LoginDialog';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { useDispatch, useSelector } from 'react-redux';
import useRouter from 'use-react-router';
import { createAddArticleAction } from 'store/actions/content';
import { Add as AddCircleIcon } from '@material-ui/icons';
import classNames from 'classnames';
import { State } from 'store/State';
import { createLoginAction, createLogoutAction } from 'store/actions/user';
import { createCloseDrawerAction } from 'store/actions/layout';

const useStyles = makeStyles(theme => ({
    root: {
        top: (theme.mixins.toolbar.minHeight as number) + theme.spacing(2),
        backgroundColor: '#fff',
        padding: '0.5em 1em 0.5em 0.5em',
        borderLeftWidth: 5,
        borderLeftColor: theme.palette.primary.main,
        borderLeftStyle: 'solid',
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

export const UserNavigation: FunctionComponent<{}> = memo(() => {
    const styles = useStyles();

    const user = useSelector<State, UserModel | null>(s => s.user.user);
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
                    {user && (
                        <div>
                            <Avatar alt={'Nutzer Name'} src={`https://avatars.dicebear.com/v2/avataaars/${user.email}.svg`} />
                            <Typography variant={'body2'} align={'center'}>
                                {user.nickname || user.name}
                            </Typography>
                        </div>
                    )}
                </Grid>
                <Grid item xs={6} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                    <Typography variant={'body2'} component={'nav'} align={'right'}>
                        <ul>
                            {user ?
                                <li><Link onClick={() => onLogout()}>Abmelden</Link></li> :
                                <>
                                    <li><Link onClick={() => setLoginModalIsOpen(true)}>Anmelden</Link></li>
                                </>
                            }
                            {user && (
                                <>
                                    <li><Link component={CollisionLink} to={'/profile'}>Mein Profil</Link></li>
                                    <li><Link component={CollisionLink} to={'/admin'}>Administration</Link></li>
                                </>
                            )}
                            <li>Impressum</li>
                            <li>Datenschutz</li>
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
            {user && (
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