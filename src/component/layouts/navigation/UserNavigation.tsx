import React, { memo, useState } from 'react';
import { AddCircle, KeyboardArrowDown, PersonOutlineOutlined, AssignmentOutlined, ExitToAppOutlined, FolderOutlined } from '@material-ui/icons';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { Grid, Link, makeStyles, Button, Menu, MenuItem, Divider, Badge } from '@material-ui/core';
import { LoginDialog } from '../../dialog/LoginDialog';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { ArticleModel } from '../../../model';
import { RegisterDialog } from 'component/dialog/RegisterDialog';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { useQuery } from '@apollo/client';
import { useOnLogout } from 'util/user/useOnLogout';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        flexShrink: 0
    },
    nav: {
        display: 'flex',
        flexDirection: 'column'
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
    },
    profileMenuLink: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginRight: '-1.1em',
        textAlign: 'center'
    },
    menu: {
        boxShadow: '4px 4px 10px #ccc6',
        '& ul': {
            padding: 0,
        },
        '& li': {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5)
        }
    }
}));

export const UserNavigation = memo(() => {
    const styles = useStyles();

    const [currentUser] = useCurrentUser();
    const { history } = useRouter();
    const { data: unpublishedArticlesData } = useQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery, {
        skip: !currentUser || !User.isAdmin(currentUser)
    });

    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(article => !article.readyToPublish || !article.category).length;

    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<HTMLElement | null>(null);

    if (currentUser) {
        return (
            <Grid container justify={'space-evenly'} className={styles.root}>
                <Grid item xs={7} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                    <Button startIcon={<AddCircle color={'secondary'} />} onClick={() => setCreateArticleModalIsOpen(true)}>Neuer Beitrag</Button>
                </Grid>
                <Grid item xs={5} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CurrentUserAvatar size={100} style={{ width: 75, height: 75 }} />
                    <Link className={styles.profileMenuLink} onClick={(e: any) => {
                        e.preventDefault();
                        setProfileMenuAnchorEl(e.currentTarget);
                    }}>
                        Mein Profil
                        <KeyboardArrowDown />
                    </Link>
                    <Menu
                        id={'profile-menu'}
                        anchorEl={profileMenuAnchorEl}
                        open={Boolean(profileMenuAnchorEl)}
                        onClose={() => { setProfileMenuAnchorEl(null); }}
                        classes={{ paper: styles.menu }}
                    >
                        {[
                            <MenuItem key={'profile'} onClick={() => { setProfileMenuAnchorEl(null); history.push('/profile'); }}>
                                <PersonOutlineOutlined />&nbsp;
                                    Mein Profil
                                </MenuItem>,
                            <MenuItem key={'files'} onClick={() => { setProfileMenuAnchorEl(null); history.push('/profile/files'); }}>
                                <FolderOutlined />&nbsp;
                                    Meine Dateien und Medien
                                </MenuItem>,
                            <MenuItem key={'ownArticles'} onClick={() => { setProfileMenuAnchorEl(null); history.push('/profile/articles'); }}>
                                <AssignmentOutlined />&nbsp;
                                Meine Beiträge
                            </MenuItem>,
                            ...(User.isAdmin(currentUser) ? [
                                <Divider key={'admin-divider'} />,
                                <MenuItem key={'administration'} onClick={() => { setProfileMenuAnchorEl(null); history.push('/admin/tenant/general'); }}>
                                    Seite administrieren
                                </MenuItem>,
                                <MenuItem key={'open-articles'} onClick={() => { setProfileMenuAnchorEl(null); history.push('/admin/unpublished'); }}>
                                    <Badge badgeContent={unpublishedBadgeNumber} color={'secondary'}>
                                        <AssignmentOutlined />
                                    </Badge>
                                    &nbsp;
                                    freizugebende Beiträge
                                </MenuItem>
                            ] : []),
                            <Divider key={'logout-divider'} />,
                            <MenuItem key={'logout'} onClick={() => { setProfileMenuAnchorEl(null); onLogout(); }}>
                                <ExitToAppOutlined />&nbsp;
                                    Abmelden
                                </MenuItem>
                        ]}
                    </Menu>
                    <CreateArticleDialog
                        isOpen={createArticleModalIsOpen}
                        onAbort={() => setCreateArticleModalIsOpen(false)}
                        onConfirm={article => {
                            history.push(Article.getPath(article, { edit: true }));
                        }}
                    />
                </Grid>
            </Grid>
        );
    } else {
        return (
            <Grid container justify={'flex-end'}>
                <Button onClick={() => setLoginModalIsOpen(true)}>Anmelden</Button>
                <Button onClick={() => setRegisterModalIsOpen(true)}>Registrieren</Button>
                <LoginDialog
                    isOpen={loginModalIsOpen}
                    onRequestClose={() => { setLoginModalIsOpen(false); }}
                />
                <RegisterDialog
                    isOpen={registerModalIsOpen}
                    onRequestClose={() => { setRegisterModalIsOpen(false); }}
                />
            </Grid>
        );
    }
});
