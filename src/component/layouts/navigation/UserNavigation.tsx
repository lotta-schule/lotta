import React, { memo, useState } from 'react';
import {
    AddCircle,
    PersonOutlineOutlined,
    AssignmentOutlined,
    ExitToAppOutlined,
    FolderOutlined,
    SecurityOutlined,
    AccountCircle,
    SearchRounded,
    Forum,
    ExpandMore,
} from '@material-ui/icons';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import {
    Grid,
    makeStyles,
    Menu,
    MenuItem,
    Divider,
    Badge,
} from '@material-ui/core';
import { LoginDialog } from '../../dialog/LoginDialog';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { ArticleModel } from '../../../model';
import { RegisterDialog } from 'component/dialog/RegisterDialog';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { useQuery } from '@apollo/client';
import { useOnLogout } from 'util/user/useOnLogout';
import { useNewMessagesBadgeNumber } from './useNewMessagesBadgeNumber';
import useRouter from 'use-react-router';
import clsx from 'clsx';
import { NavigationButton } from 'component/general/button/NavigationButton';

const useStyles = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        height: '100%',
        justifyContent: 'center',
        paddingRight: theme.spacing(1),
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
    },
    button: {
        width: '100%',
        justifyContent: 'left',
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    badge: {
        left: '-2.5em',
        transform: 'scale(1) translate(0%, 0%)',
    },
    menu: {
        boxShadow: '4px 4px 10px #ccc6',
        border: '1px solid',
        borderColor: '#bdbdbd',
        marginTop: '2.5em',
        '& ul': {
            padding: 0,
        },
        '& li': {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5),
        },
    },
    avatarContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(1, 0, 1, 0),
    },
}));

export const UserNavigation = memo(() => {
    const styles = useStyles();

    const currentUser = useCurrentUser();
    const { history } = useRouter();
    const { data: unpublishedArticlesData } = useQuery<{
        articles: ArticleModel[];
    }>(GetUnpublishedArticlesQuery, {
        skip: !currentUser || !User.isAdmin(currentUser),
    });
    const newMessagesBadgeNumber = useNewMessagesBadgeNumber();
    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(
        false
    );

    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
        (article) => !article.readyToPublish || !article.published
    ).length;

    const [
        profileMenuAnchorEl,
        setProfileMenuAnchorEl,
    ] = useState<HTMLElement | null>(null);

    let nav;
    if (currentUser) {
        nav = (
            <Grid container className={styles.root}>
                <Grid item xs={5} className={styles.avatarContainer}>
                    <CurrentUserAvatar
                        size={100}
                        style={{ width: 100, height: 100 }}
                    />
                </Grid>
                <Grid
                    item
                    xs={7}
                    style={{ marginTop: 'auto', marginBottom: 'auto' }}
                >
                    <div className={clsx(styles.root, 'usernavigation')}>
                        <NavigationButton
                            onClick={() => setCreateArticleModalIsOpen(true)}
                            icon={<AddCircle />}
                            label={'neuer Beitrag'}
                            className={clsx(
                                'secondary',
                                'small',
                                'usernavigation-button'
                            )}
                        ></NavigationButton>
                        <NavigationButton
                            onClick={() => history.push('/search')}
                            icon={<SearchRounded />}
                            label={'Suche'}
                            className={clsx(
                                'secondary',
                                'small',
                                'usernavigation-button'
                            )}
                        ></NavigationButton>
                        <NavigationButton
                            onClick={() => history.push('/messaging')}
                            icon={
                                <Badge
                                    badgeContent={newMessagesBadgeNumber}
                                    color={'primary'}
                                >
                                    <Forum color={'secondary'} />
                                </Badge>
                            }
                            label={'Nachrichten'}
                            className={clsx(
                                'secondary',
                                'small',
                                'usernavigation-button'
                            )}
                        ></NavigationButton>
                        <NavigationButton
                            icon={<AccountCircle />}
                            className={clsx(
                                'secondary',
                                'small',
                                'usernavigation-button'
                            )}
                            onClick={(e: any) => {
                                e.preventDefault();
                                setProfileMenuAnchorEl(e.currentTarget);
                            }}
                        >
                            Mein Profil <ExpandMore color={'secondary'} />
                        </NavigationButton>
                        <Menu
                            id={'profile-menu'}
                            anchorEl={profileMenuAnchorEl}
                            open={Boolean(profileMenuAnchorEl)}
                            onClose={() => {
                                setProfileMenuAnchorEl(null);
                            }}
                            classes={{ paper: styles.menu }}
                        >
                            {[
                                <MenuItem
                                    key={'profile'}
                                    onClick={() => {
                                        setProfileMenuAnchorEl(null);
                                        history.push('/profile');
                                    }}
                                >
                                    <PersonOutlineOutlined
                                        color={'secondary'}
                                    />
                                    &nbsp; Meine Daten
                                </MenuItem>,
                                <MenuItem
                                    key={'files'}
                                    onClick={() => {
                                        setProfileMenuAnchorEl(null);
                                        history.push('/profile/files');
                                    }}
                                >
                                    <FolderOutlined color={'secondary'} />
                                    &nbsp; Meine Dateien und Medien
                                </MenuItem>,
                                <MenuItem
                                    key={'ownArticles'}
                                    onClick={() => {
                                        setProfileMenuAnchorEl(null);
                                        history.push('/profile/articles');
                                    }}
                                >
                                    <AssignmentOutlined color={'secondary'} />
                                    &nbsp; Meine Beiträge
                                </MenuItem>,
                                ...(User.isAdmin(currentUser)
                                    ? [
                                          <Divider key={'admin-divider'} />,
                                          <MenuItem
                                              key={'administration'}
                                              onClick={() => {
                                                  setProfileMenuAnchorEl(null);
                                                  history.push(
                                                      '/admin/system/general'
                                                  );
                                              }}
                                          >
                                              <SecurityOutlined
                                                  color={'secondary'}
                                              />
                                              &nbsp; Seite administrieren
                                          </MenuItem>,
                                          <MenuItem
                                              key={'open-articles'}
                                              onClick={() => {
                                                  setProfileMenuAnchorEl(null);
                                                  history.push(
                                                      '/admin/unpublished'
                                                  );
                                              }}
                                          >
                                              <Badge
                                                  badgeContent={
                                                      unpublishedBadgeNumber
                                                  }
                                                  color={'secondary'}
                                              >
                                                  <AssignmentOutlined
                                                      color={'secondary'}
                                                  />
                                              </Badge>
                                              &nbsp; freizugebende Beiträge
                                          </MenuItem>,
                                      ]
                                    : []),
                                <Divider key={'logout-divider'} />,
                                <MenuItem
                                    key={'logout'}
                                    onClick={() => {
                                        setProfileMenuAnchorEl(null);
                                        onLogout();
                                    }}
                                >
                                    <ExitToAppOutlined color={'secondary'} />
                                    &nbsp; Abmelden
                                </MenuItem>,
                            ]}
                        </Menu>
                        <CreateArticleDialog
                            isOpen={createArticleModalIsOpen}
                            onAbort={() => setCreateArticleModalIsOpen(false)}
                            onConfirm={(article) => {
                                history.push(
                                    Article.getPath(article, { edit: true })
                                );
                            }}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    } else {
        nav = (
            <Grid
                container
                direction={'column'}
                alignItems={'flex-end'}
                className={styles.root}
            >
                <NavigationButton
                    onClick={() => setLoginModalIsOpen(true)}
                    label={'Anmelden'}
                    className={clsx('secondary', 'small')}
                ></NavigationButton>
                <NavigationButton
                    onClick={() => setRegisterModalIsOpen(true)}
                    label={'Registrieren'}
                    className={clsx('secondary', 'small')}
                ></NavigationButton>
                <NavigationButton
                    onClick={() => history.push('/search')}
                    label={'Suche'}
                    className={clsx('secondary', 'small')}
                ></NavigationButton>
                <RegisterDialog
                    isOpen={registerModalIsOpen}
                    onRequestClose={() => {
                        setRegisterModalIsOpen(false);
                    }}
                />
            </Grid>
        );
    }
    return (
        <>
            {nav}
            <LoginDialog
                isOpen={loginModalIsOpen}
                onRequestClose={() => {
                    setLoginModalIsOpen(false);
                }}
            />
        </>
    );
});
