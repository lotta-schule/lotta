import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Badge, BaseButton, Button } from '@lotta-schule/hubert';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Icon } from 'shared/Icon';
import {
    faComments,
    faFolder,
    faUser,
} from '@fortawesome/free-regular-svg-icons';
import {
    faMagnifyingGlass,
    faShieldHalved,
    faClipboardList,
    faArrowRightFromBracket,
    faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import { ArticleModel } from 'model';
import { User, Article } from 'util/model';
import { useOnLogout } from 'util/user/useOnLogout';
import { isMobileDrawerOpenVar } from 'api/cache';
import { CreateArticleDialog } from 'shared/dialog/CreateArticleDialog';
import { LoginDialog } from 'shared/dialog/LoginDialog';
import { RegisterDialog } from 'shared/dialog/RegisterDialog';
import { useRouter } from 'next/router';
import Link from 'next/link';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';

import styles from './UserNavigationMobile.module.scss';

export const UserNavigationMobile = React.memo(() => {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const newMessagesBadgeNumber = currentUser?.unreadMessages ?? 0;
    const onLogout = useOnLogout();

    const { data: unpublishedArticlesData } = useQuery<{
        articles: ArticleModel[];
    }>(GetUnpublishedArticlesQuery, {
        skip: !currentUser || !User.isAdmin(currentUser),
    });
    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(
        (article) => !article.readyToPublish || !article.published
    ).length;

    const [loginModalIsOpen, setLoginModalIsOpen] = React.useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = React.useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] =
        React.useState(false);

    React.useEffect(() => {
        if (
            loginModalIsOpen ||
            registerModalIsOpen ||
            createArticleModalIsOpen
        ) {
            isMobileDrawerOpenVar(false);
        }
    }, [createArticleModalIsOpen, loginModalIsOpen, registerModalIsOpen]);

    if (currentUser) {
        return (
            <>
                <nav className={styles.root}>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                        onClick={() => {
                            onLogout();
                        }}
                        data-testid="LogoutButton"
                    >
                        <Icon icon={faArrowRightFromBracket} size="xl" />
                        <span className={styles.label}>Abmelden</span>
                    </BaseButton>
                    <BaseButton
                        variant={'borderless'}
                        className={styles.button}
                        onClick={() => {
                            setCreateArticleModalIsOpen(true);
                        }}
                        data-testid="CreateArticleButton"
                    >
                        <Icon icon={faCirclePlus} size="lg" />
                        <span className={styles.label}>Beitrag</span>
                    </BaseButton>
                    <Link href={'/search'} passHref>
                        <BaseButton
                            variant={'borderless'}
                            className={styles.button}
                            data-testid="SearchButton"
                        >
                            <Icon icon={faMagnifyingGlass} size="xl" />
                            <span className={styles.label}>Suche</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile'} passHref>
                        <BaseButton
                            variant={'borderless'}
                            className={styles.button}
                            data-testid="ProfileButton"
                        >
                            <Icon icon={faUser} size="xl" />
                            <span className={styles.label}>Profil</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile/files'} passHref>
                        <BaseButton
                            variant={'borderless'}
                            className={styles.button}
                            data-testid="ProfileFilesButton"
                        >
                            <Icon icon={faFolder} size="xl" />
                            <span className={styles.label}>Dateien</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile/articles'} passHref>
                        <BaseButton
                            variant={'borderless'}
                            className={styles.button}
                            data-testid="OwnArticlesButton"
                        >
                            <Icon icon={faClipboardList} size="xl" />
                            <span className={styles.label}>Meine Beiträge</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/messaging'} passHref>
                        <BaseButton
                            variant={'borderless'}
                            className={styles.button}
                            data-testid="MessagingButton"
                        >
                            <Icon icon={faComments} size={'lg'} />
                            <span className={styles.label}>
                                Nachrichten{' '}
                                <Badge
                                    value={newMessagesBadgeNumber}
                                    className={styles.badge}
                                />
                            </span>
                        </BaseButton>
                    </Link>
                    {User.isAdmin(currentUser) && (
                        <>
                            <Link href={'/admin'} passHref>
                                <BaseButton
                                    variant={'borderless'}
                                    className={styles.button}
                                    data-testid="AdminButton"
                                >
                                    <Icon icon={faShieldHalved} size="xl" />
                                    <span className={styles.label}>Admin</span>
                                </BaseButton>
                            </Link>
                            <Link href={'/admin/unpublished'} passHref>
                                <BaseButton
                                    variant={'borderless'}
                                    className={styles.button}
                                >
                                    <Icon icon={faClipboardList} size="xl" />
                                    <span className={styles.label}>
                                        Beiträge freigeben
                                        <Badge
                                            value={unpublishedBadgeNumber}
                                            className={styles.badge}
                                            data-testid="UnpublishedArticlesButton"
                                        />
                                    </span>
                                </BaseButton>
                            </Link>
                        </>
                    )}
                    {!User.isAdmin(currentUser) && (
                        <>
                            <div />
                            <div />
                        </>
                    )}
                    <div />
                </nav>
                <CreateArticleDialog
                    isOpen={createArticleModalIsOpen}
                    onAbort={() => setCreateArticleModalIsOpen(false)}
                    onConfirm={(article) => {
                        router.push(Article.getPath(article, { edit: true }));
                    }}
                />
            </>
        );
    }
    return (
        <>
            <div>
                <Button
                    fullWidth
                    variant={'borderless'}
                    onClick={() => setLoginModalIsOpen(true)}
                    data-testid="LoginButton"
                >
                    Anmelden
                </Button>
                <Button
                    variant={'borderless'}
                    fullWidth
                    onClick={() => setRegisterModalIsOpen(true)}
                    data-testid="RegisterButton"
                >
                    Registrieren
                </Button>
                <Link href={'/search'} passHref>
                    <Button
                        fullWidth
                        data-testid="SearchButton"
                        variant={'borderless'}
                    >
                        Suche
                    </Button>
                </Link>
            </div>
            <LoginDialog
                isOpen={loginModalIsOpen}
                onRequestClose={() => {
                    setLoginModalIsOpen(false);
                }}
            />
            <RegisterDialog
                isOpen={registerModalIsOpen}
                onRequestClose={() => {
                    setRegisterModalIsOpen(false);
                }}
            />
        </>
    );
});
UserNavigationMobile.displayName = 'UserNavigationMobile';
