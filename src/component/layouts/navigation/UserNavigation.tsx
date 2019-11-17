import React, { memo, useState, useEffect } from 'react';
import { Add as AddCircleIcon, } from '@material-ui/icons';
import { CollisionLink } from '../../general/CollisionLink';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { Grid, Typography, Link, makeStyles, Button, Badge } from '@material-ui/core';
import { LoginDialog } from '../../dialog/LoginDialog';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { ArticleModel } from '../../../model';
import { RegisterDialog } from 'component/dialog/RegisterDialog';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { useLazyQuery } from '@apollo/react-hooks';
import { useOnLogout } from 'util/user/useOnLogout';
import { useCategories } from 'util/categories/useCategories';
import classNames from 'classnames';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        top: (theme.mixins.toolbar.minHeight as number) + theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        padding: '0.5em 1em 0.5em 0.5em',
        height: 136,
        flexShrink: 0,
        marginBottom: theme.spacing(1),
    },
    button: {
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    badge: {
        left: '-2.5em',
        transform: 'scale(1) translate(0%, 0%)'
    }
}));

export const UserNavigation = memo(() => {
    const styles = useStyles();

    const [currentUser] = useCurrentUser();
    const { history } = useRouter();
    const [loadUnpublishedArticles, { data: unpublishedArticlesData, called: calledUnpublishedArticles }] = useLazyQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery);

    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    useEffect(() => {
        if (currentUser && User.isAdmin(currentUser) && !calledUnpublishedArticles) {
            loadUnpublishedArticles();
        }
    }, [calledUnpublishedArticles, currentUser, loadUnpublishedArticles]);

    const unpublishedArticles = unpublishedArticlesData ? (unpublishedArticlesData.articles || []) : [];
    const unpublishedBadgeNumber = [...unpublishedArticles].filter(article => !article.readyToPublish || !article.category).length;

    const categories = useCategories()[0].filter(category => category.isSidenav);

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
                                <li>
                                    <Link component={CollisionLink} to={'/profile'}>
                                        Mein Profil
                                    </Link>
                                </li>
                            )}
                            {User.isAdmin(currentUser) && (
                                <li>
                                    <Badge
                                        badgeContent={unpublishedBadgeNumber}
                                        color="secondary"
                                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                                        classes={{ badge: styles.badge }}
                                        showZero={false}
                                    >
                                        <Link component={CollisionLink} to={'/admin'}>Administration</Link>
                                    </Badge>
                                </li>
                            )}
                            {categories.map(category => (
                                <li key={category.id}>
                                    <Link component={CollisionLink} to={`/category/${category.id}`}>{category.title}</Link>
                                </li>
                            ))}
                            <li><Link component={CollisionLink} to={`/privacy`}>Datenschutz</Link></li>
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
            {currentUser && (
                <>
                    <Button size="small" variant="outlined" color="secondary" className={styles.button} onClick={() => setCreateArticleModalIsOpen(true)}>
                        <AddCircleIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                        Neuer Beitrag
                    </Button>
                    <CreateArticleDialog
                        isOpen={createArticleModalIsOpen}
                        onAbort={() => setCreateArticleModalIsOpen(false)}
                        onConfirm={article => {
                            history.push(`/article/${article.id}/edit`);
                        }}
                    />
                </>
            )}
            {!currentUser && (
                <>
                    <LoginDialog
                        isOpen={loginModalIsOpen}
                        onRequestClose={() => { setLoginModalIsOpen(false); }}
                    />
                    <RegisterDialog
                        isOpen={registerModalIsOpen}
                        onRequestClose={() => { setRegisterModalIsOpen(false); }}
                    />
                </>
            )}
        </>
    );
});