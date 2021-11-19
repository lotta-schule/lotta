import * as React from 'react';
import { Grid, Menu, MenuItem, Badge } from '@material-ui/core';
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
import { useQuery } from '@apollo/client';
import { ArticleModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { LoginDialog } from 'shared/dialog/LoginDialog';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { useOnLogout } from 'util/user/useOnLogout';
import { Divider } from 'shared/general/divider/Divider';
import { NavigationButton } from 'shared/general/button/NavigationButton';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'shared/userAvatar/UserAvatar';
import { useNewMessagesBadgeNumber } from 'messaging/hook/useNewMessagesBadgeNumber';
import { useRouter } from 'next/router';
import Link from 'next/link';
import clsx from 'clsx';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';

import styles from './UserNavigation.module.scss';

export const UserNavigation = React.memo(() => {
    const currentUser = useCurrentUser();
    const router = useRouter();
    const { data: unpublishedArticlesData } = useQuery<{
        articles: ArticleModel[];
    }>(GetUnpublishedArticlesQuery, {
        skip: !currentUser || !User.isAdmin(currentUser),
    });
    const newMessagesBadgeNumber = useNewMessagesBadgeNumber();
    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = React.useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = React.useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] =
        React.useState(false);

    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
        (article) => !article.readyToPublish || !article.published
    ).length;

    const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
        React.useState<HTMLElement | null>(null);

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
                        <Link href={'/search'} passHref>
                            <NavigationButton
                                icon={<SearchRounded />}
                                label={'Suche'}
                                className={clsx(
                                    'secondary',
                                    'small',
                                    'usernavigation-button'
                                )}
                            ></NavigationButton>
                        </Link>
                        <Link href={'/messaging'} passHref>
                            <NavigationButton
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
                        </Link>
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
                                        router.push('/profile');
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
                                        router.push('/profile/files');
                                    }}
                                >
                                    <FolderOutlined color={'secondary'} />
                                    &nbsp; Meine Dateien und Medien
                                </MenuItem>,
                                <MenuItem
                                    key={'ownArticles'}
                                    onClick={() => {
                                        setProfileMenuAnchorEl(null);
                                        router.push('/profile/articles');
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
                                                  router.push('/admin');
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
                                                  router.push(
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
                                router.push(
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
                <Link href={'/search'} passHref>
                    <NavigationButton
                        onClick={() => router.push('/search')}
                        label={'Suche'}
                        className={clsx('secondary', 'small')}
                    ></NavigationButton>
                </Link>
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
UserNavigation.displayName = 'UserNavigation';
