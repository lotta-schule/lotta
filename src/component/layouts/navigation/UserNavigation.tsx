import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import { Add as AddCircleIcon, } from '@material-ui/icons';
import { CollisionLink } from '../../general/CollisionLink';
import { createAddArticleAction } from 'store/actions/content';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { Grid, Typography, Link, makeStyles, Button, Badge } from '@material-ui/core';
import { LoginDialog } from '../../dialog/LoginDialog';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useDispatch } from 'react-redux';
import { User } from 'util/model';
import { ArticleModel, UserModel } from '../../../model';
import classNames from 'classnames';
import useRouter from 'use-react-router';
import { RegisterDialog } from 'component/dialog/RegisterDialog';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useOnLogout } from 'util/user/useOnLogout';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';

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
    badge: {
        top: '45%',
        right: 80,
    }
}));

export const UserNavigation: FunctionComponent<{}> = memo(() => {
    const styles = useStyles();

    // const { data } = useQuery<{ currentUser: UserModel | null }>(GetCurrentUserQuery);
    // let currentUser: UserModel | null = null;
    // if (data && data.currentUser) {
    //     currentUser = data.currentUser;
    // }
    const currentUser = useCurrentUser();
    const { history } = useRouter();
    const [loadOwnArticles, { data: ownArticlesData }] = useLazyQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);

    const dispatch = useDispatch();
    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadOwnArticles();
        }
    }, [currentUser, loadOwnArticles]);

    const ownArticles = ownArticlesData ? (ownArticlesData.articles || []) : [];
    const profileBadgeNumber = [...ownArticles].filter(article => !article.readyToPublish || !article.category).length;

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
                                    <li><Link onClick={() => setRegisterModalIsOpen(true)}>Registrieren</Link></li>
                                </>
                            }
                            {currentUser && (
                                <li><Link component={CollisionLink} to={'/profile'}>
                                    {profileBadgeNumber && profileBadgeNumber > 0 ? (
                                        <Badge classes={{ badge: styles.badge }} badgeContent={profileBadgeNumber} color="secondary">
                                            Mein Profil
                                        </Badge>
                                    ) : <span>Mein Profil</span>}
                                </Link></li>
                            )}
                            {User.isAdmin(currentUser) && (
                                <li><Link component={CollisionLink} to={'/admin'}>Administration</Link></li>
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
                    history.push(`/article/${article.id}/edit`);
                }}
            />
            <LoginDialog
                isOpen={loginModalIsOpen}
                onRequestClose={() => setLoginModalIsOpen(false)}
            />
            <RegisterDialog
                isOpen={registerModalIsOpen}
                onRequestClose={() => setRegisterModalIsOpen(false)}
            />
        </>
    );
});