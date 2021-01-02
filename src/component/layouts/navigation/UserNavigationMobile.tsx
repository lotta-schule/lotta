import React, { memo, useState } from 'react';
import { makeStyles, ButtonBase, Badge, Button, Typography } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import {
    ExitToAppOutlined, AddCircleOutlineOutlined, SecurityOutlined, FolderOutlined,
    QuestionAnswerOutlined, AssignmentOutlined, PersonOutlineOutlined, SearchOutlined
} from '@material-ui/icons';
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
        fontSize: '85%',
        '& > :first-child': {
            width: '35%',
            height: '35%'
        },
    },
    badge: {
        '& svg': {
            width: '100%',
            height: '100%'
        }
    },
    label: {
        height: '3em',
    }
}));

export const UserNavigationMobile = memo(() => {
    const styles = useStyles();
    const history = useHistory();
    const currentUser = useCurrentUser();
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
                        <Typography className={styles.label}>Abmelden</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { setCreateArticleModalIsOpen(true); }} data-testid="CreateArticleButton">
                        <AddCircleOutlineOutlined color={'secondary'} />
                        <Typography className={styles.label}>Beitrag</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/search'); }} data-testid="SearchButton">
                        <SearchOutlined color={'secondary'} />
                        <Typography className={styles.label}>Suche</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile'); }} data-testid="ProfileButton">
                        <PersonOutlineOutlined color={'secondary'} />
                        <Typography className={styles.label}>Profil</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/files'); }} data-testid="ProfileFilesButton">
                        <FolderOutlined color={'secondary'} />
                        <Typography className={styles.label}>Dateien</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/articles'); }} data-testid="OwnArticlesButton">
                        <AssignmentOutlined color={'secondary'} />
                        <Typography className={styles.label}>Meine Beiträge</Typography>
                    </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/messaging'); }} data-testid="MessagingButton">
                        <QuestionAnswerOutlined color={'secondary'} />
                        <Typography className={styles.label}>Nachrichten</Typography>
                    </ButtonBase>
                    {User.isAdmin(currentUser) && (
                        <>
                            <ButtonBase className={styles.button} onClick={() => { history.push('/admin/system/general'); }} data-testid="AdminButton">
                                <SecurityOutlined color={'secondary'} />
                                <Typography className={styles.label}>Admin</Typography>
                            </ButtonBase>
                            <ButtonBase className={styles.button} onClick={() => { history.push('/admin/unpublished'); }}>
                                <Badge badgeContent={unpublishedBadgeNumber} className={styles.badge} color={'secondary'} data-testid="UnpublishedArticlesButton">
                                    <AssignmentOutlined color={'secondary'} />
                                </Badge>
                                <Typography className={styles.label}>freizugende Beiträge</Typography>
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
