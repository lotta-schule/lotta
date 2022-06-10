import * as React from 'react';
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
import { Badge } from 'shared/general/badge/Badge';
import { useQuery } from '@apollo/client';
import { ArticleModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { LoginDialog } from 'shared/dialog/LoginDialog';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { useOnLogout } from 'util/user/useOnLogout';
import { NavigationButton } from 'shared/general/button/NavigationButton';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { CurrentUserAvatar } from 'shared/userAvatar/UserAvatar';
import { useRouter } from 'next/router';
import { Menu, MenuItem, MenuList } from 'shared/general/menu';
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
    const newMessagesBadgeNumber = currentUser?.unreadMessages ?? 0;
    const onLogout = useOnLogout();

    const [loginModalIsOpen, setLoginModalIsOpen] = React.useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = React.useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] =
        React.useState(false);

    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
        (article) => !article.readyToPublish || !article.published
    ).length;

    let nav;
    if (currentUser) {
        nav = (
            <div className={styles.loggedInContainer}>
                <div className={styles.avatarContainer}>
                    <CurrentUserAvatar
                        size={100}
                        style={{ width: 100, height: 100 }}
                    />
                </div>
                <nav>
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
                            className={clsx(
                                'secondary',
                                'small',
                                'usernavigation-button'
                            )}
                            icon={
                                <span>
                                    <Forum color={'secondary'} />
                                </span>
                            }
                        >
                            Nachrichten
                            <Badge value={newMessagesBadgeNumber} />{' '}
                        </NavigationButton>
                    </Link>
                    <Menu
                        buttonProps={{
                            icon: <AccountCircle />,
                            children: (
                                <>
                                    Mein Profil{' '}
                                    <ExpandMore color={'secondary'} />
                                </>
                            ),
                            className: clsx(
                                'lotta-navigation-button',
                                'secondary',
                                'small',
                                'usernavigation-button'
                            ),
                        }}
                    >
                        <MenuList className={styles.menuList}>
                            {[
                                <Link
                                    passHref
                                    href={'/profile'}
                                    key={'profile'}
                                >
                                    <MenuItem
                                        leftSection={
                                            <PersonOutlineOutlined
                                                color={'secondary'}
                                            />
                                        }
                                    >
                                        Meine Daten
                                    </MenuItem>
                                </Link>,
                                <Link
                                    passHref
                                    href={'/profile/files'}
                                    key={'files'}
                                >
                                    <MenuItem
                                        leftSection={
                                            <FolderOutlined
                                                color={'secondary'}
                                            />
                                        }
                                    >
                                        Meine Dateien und Medien
                                    </MenuItem>
                                </Link>,
                                <Link
                                    passHref
                                    href={'/profile/articles'}
                                    key={'ownArticles'}
                                >
                                    <MenuItem
                                        leftSection={
                                            <AssignmentOutlined
                                                color={'secondary'}
                                            />
                                        }
                                    >
                                        Meine Beiträge
                                    </MenuItem>
                                </Link>,
                                ...(User.isAdmin(currentUser)
                                    ? [
                                          <MenuItem
                                              isDivider
                                              key={'administration-divider1'}
                                          />,
                                          <Link
                                              passHref
                                              href={'/admin'}
                                              key={'administration'}
                                          >
                                              <MenuItem
                                                  leftSection={
                                                      <SecurityOutlined
                                                          color={'secondary'}
                                                      />
                                                  }
                                              >
                                                  Seite administrieren
                                              </MenuItem>
                                          </Link>,
                                          <Link
                                              passHref
                                              href={'/admin/unpublished'}
                                              key={'unpublished'}
                                          >
                                              <MenuItem
                                                  leftSection={
                                                      <AssignmentOutlined
                                                          color={'secondary'}
                                                      />
                                                  }
                                              >
                                                  Beiträge freigeben
                                                  <Badge
                                                      value={
                                                          unpublishedBadgeNumber
                                                      }
                                                  />
                                              </MenuItem>
                                          </Link>,
                                      ]
                                    : []),
                                <MenuItem isDivider key={'logout-divider'} />,
                                <MenuItem
                                    key={'logout'}
                                    href={'#'}
                                    leftSection={
                                        <ExitToAppOutlined
                                            color={'secondary'}
                                        />
                                    }
                                    onClick={(
                                        e: React.MouseEvent<
                                            HTMLLinkElement,
                                            MouseEvent
                                        >
                                    ) => {
                                        e.preventDefault();
                                        onLogout();
                                    }}
                                >
                                    Abmelden
                                </MenuItem>,
                            ]}
                        </MenuList>
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
                </nav>
            </div>
        );
    } else {
        nav = (
            <nav>
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
            </nav>
        );
    }
    return (
        <div className={styles.root}>
            {nav}
            <LoginDialog
                isOpen={loginModalIsOpen}
                onRequestClose={() => {
                    setLoginModalIsOpen(false);
                }}
            />
        </div>
    );
});
UserNavigation.displayName = 'UserNavigation';
