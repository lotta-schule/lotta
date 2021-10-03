import * as React from 'react';
import { Badge } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import {
    ExitToAppOutlined,
    AddCircleOutlineOutlined,
    SecurityOutlined,
    FolderOutlined,
    QuestionAnswerOutlined,
    AssignmentOutlined,
    PersonOutlineOutlined,
    SearchOutlined,
} from '@material-ui/icons';
import { BaseButton } from 'component/general/button/BaseButton';
import { Button } from 'component/general/button/Button';
import { useOnLogout } from 'util/user/useOnLogout';
import { useNewMessagesBadgeNumber } from './useNewMessagesBadgeNumber';
import { useQuery } from '@apollo/client';
import { ArticleModel } from 'model';
import { User, Article } from 'util/model';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { LoginDialog } from 'component/dialog/LoginDialog';
import { RegisterDialog } from 'component/dialog/RegisterDialog';
import { useRouter } from 'next/router';
import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';
import Link from 'next/link';

import styles from './UserNavigationMobile.module.scss';

export const UserNavigationMobile = React.memo(() => {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const newMessagesBadgeNumber = useNewMessagesBadgeNumber();
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

    if (currentUser) {
        return (
            <>
                <nav className={styles.root}>
                    <BaseButton
                        className={styles.button}
                        onClick={() => {
                            onLogout();
                        }}
                        data-testid="LogoutButton"
                    >
                        <ExitToAppOutlined />
                        <span className={styles.label}>Abmelden</span>
                    </BaseButton>
                    <BaseButton
                        className={styles.button}
                        onClick={() => {
                            setCreateArticleModalIsOpen(true);
                        }}
                        data-testid="CreateArticleButton"
                    >
                        <AddCircleOutlineOutlined color={'secondary'} />
                        <span className={styles.label}>Beitrag</span>
                    </BaseButton>
                    <Link href={'/search'} passHref>
                        <BaseButton
                            className={styles.button}
                            data-testid="SearchButton"
                        >
                            <SearchOutlined color={'secondary'} />
                            <span className={styles.label}>Suche</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile'} passHref>
                        <BaseButton
                            className={styles.button}
                            data-testid="ProfileButton"
                        >
                            <PersonOutlineOutlined color={'secondary'} />
                            <span className={styles.label}>Profil</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile/files'} passHref>
                        <BaseButton
                            className={styles.button}
                            data-testid="ProfileFilesButton"
                        >
                            <FolderOutlined color={'secondary'} />
                            <span className={styles.label}>Dateien</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile/articles'} passHref>
                        <BaseButton
                            className={styles.button}
                            data-testid="OwnArticlesButton"
                        >
                            <AssignmentOutlined color={'secondary'} />
                            <span className={styles.label}>Meine Beiträge</span>
                        </BaseButton>
                    </Link>
                    <Link href={'/profile/messaging'} passHref>
                        <BaseButton
                            className={styles.button}
                            data-testid="MessagingButton"
                        >
                            <Badge
                                badgeContent={newMessagesBadgeNumber}
                                className={styles.badge}
                                color={'secondary'}
                            >
                                <QuestionAnswerOutlined color={'secondary'} />
                            </Badge>
                            <span className={styles.label}>Nachrichten</span>
                        </BaseButton>
                    </Link>
                    {User.isAdmin(currentUser) && (
                        <>
                            <Link href={'/admin'} passHref>
                                <BaseButton
                                    className={styles.button}
                                    data-testid="AdminButton"
                                >
                                    <SecurityOutlined color={'secondary'} />
                                    <span className={styles.label}>Admin</span>
                                </BaseButton>
                            </Link>
                            <Link href={'/admin/unpublished'} passHref>
                                <BaseButton className={styles.button}>
                                    <Badge
                                        badgeContent={unpublishedBadgeNumber}
                                        className={styles.badge}
                                        color={'secondary'}
                                        data-testid="UnpublishedArticlesButton"
                                    >
                                        <AssignmentOutlined
                                            color={'secondary'}
                                        />
                                    </Badge>
                                    <span className={styles.label}>
                                        freizugende Beiträge
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
        <div>
            <Button
                fullWidth
                onClick={() => setLoginModalIsOpen(true)}
                data-testid="LoginButton"
            >
                Anmelden
            </Button>
            <Button
                fullWidth
                onClick={() => setRegisterModalIsOpen(true)}
                data-testid="RegisterButton"
            >
                Registrieren
            </Button>
            <Link href={'/search'} passHref>
                <Button fullWidth data-testid="SearchButton">
                    Suche
                </Button>
            </Link>
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
        </div>
    );
});
