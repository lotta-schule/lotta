import React, { memo, useState } from 'react';
import { makeStyles, ButtonBase, Badge, Button } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ExitToAppOutlined, AddCircleOutlineOutlined, SecurityOutlined, FolderOutlined, AssignmentOutlined, PersonOutlineOutlined, SearchOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { useOnLogout } from 'util/user/useOnLogout';
import { useQuery } from '@apollo/client';
import { ArticleModel } from 'model';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { User, Article } from 'util/model';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { LoginDialog } from 'component/dialog/LoginDialog';
import { RegisterDialog } from 'component/dialog/RegisterDialog';

const useStyles = makeStyles(() => ({
    root: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        height: '50vh'
    },
    button: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '100%',
        '& > :first-child': {
            width: '50%',
            height: '50%'
        },
    },
    badge: {
        '& svg': {
            width: '100%',
            height: '100%'
        }
    }
}));

export const UserNavigationMobile = memo(() => {
    const styles = useStyles();
    const history = useHistory();
    const [currentUser] = useCurrentUser();
    const onLogout = useOnLogout();

    const { data: unpublishedArticlesData } = useQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery, {
        skip: !currentUser || !User.isAdmin(currentUser)
    });
    const unpublishedBadgeNumber = unpublishedArticlesData?.articles.filter(article => !article.readyToPublish || !article.category).length;

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    if (currentUser) {
        return (
            <>
                <nav className={styles.root}>
                    <ButtonBase className={styles.button} onClick={() => { onLogout(); }} data-testid="LogoutButton">
                        <ExitToAppOutlined color={'secondary'} />
                        Abmelden
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { setCreateArticleModalIsOpen(true); }} data-testid="CreateArticleButton">
                        <AddCircleOutlineOutlined color={'secondary'} />
                        Beitrag
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/search'); }} data-testid="SearchButton">
                        <SearchOutlined color={'secondary'} />
                        Suche
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile'); }} data-testid="ProfileButton">
                        <PersonOutlineOutlined color={'secondary'} />
                        Profil
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/files'); }} data-testid="ProfileFilesButton">
                        <FolderOutlined color={'secondary'} />
                        Dateien
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/articles'); }} data-testid="OwnArticlesButton">
                        <AssignmentOutlined color={'secondary'} />
                        Meine Beiträge
                    </ButtonBase>
                    {User.isAdmin(currentUser) && (
                        <>
                            <ButtonBase className={styles.button} onClick={() => { history.push('/admin/tenant/general'); }}>
                                <SecurityOutlined color={'secondary'} />
                                Admin
                            </ButtonBase>
                            <ButtonBase className={styles.button} onClick={() => { history.push('/admin/unpublished'); }}>
                                <Badge badgeContent={unpublishedBadgeNumber} className={styles.badge} color={'secondary'}>
                                    <AssignmentOutlined color={'secondary'} />
                                </Badge>
                                freizugebene Beiträge
                            </ButtonBase>
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
                    onConfirm={article => {
                        history.push(Article.getPath(article, { edit: true }));
                    }}
                />
            </>
        );
    }
    return (
        <div>
            <Button fullWidth onClick={() => setLoginModalIsOpen(true)} data-testid="LoginButton">
                Anmelden
            </Button>
            <Button fullWidth onClick={() => setRegisterModalIsOpen(true)} data-testid="RegisterButton">
                Registrieren
            </Button>
            <Button fullWidth onClick={() => { history.push('/search'); }} data-testid="SearchButton">
                Suche
            </Button>
            <LoginDialog
                isOpen={loginModalIsOpen}
                onRequestClose={() => { setLoginModalIsOpen(false); }}
            />
            <RegisterDialog
                isOpen={registerModalIsOpen}
                onRequestClose={() => { setRegisterModalIsOpen(false); }}
            />

        </div>
    );
});
