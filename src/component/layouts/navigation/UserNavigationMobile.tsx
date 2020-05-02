import React, { memo, useState } from 'react';
import { makeStyles, ButtonBase, Badge } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ExitToAppOutlined, AddCircleOutlineOutlined, SecurityOutlined, FolderOutlined, AssignmentOutlined, PersonOutlineOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { useOnLogout } from 'util/user/useOnLogout';
import { useQuery } from '@apollo/client';
import { ArticleModel } from 'model';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { User, Article } from 'util/model';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';

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

    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);

    if (currentUser) {
        return (
            <>
                <nav className={styles.root}>
                    <ButtonBase className={styles.button} onClick={() => { onLogout(); }}>
                        <ExitToAppOutlined color={'secondary'} />
                    Abmelden
                </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { setCreateArticleModalIsOpen(true); }}>
                        <AddCircleOutlineOutlined color={'secondary'} />
                    Beitrag
                </ButtonBase>
                    <div />
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile'); }}>
                        <PersonOutlineOutlined color={'secondary'} />
                    Profil
                </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/files'); }}>
                        <FolderOutlined color={'secondary'} />
                    Dateien
                </ButtonBase>
                    <ButtonBase className={styles.button} onClick={() => { history.push('/profile/articles'); }}>
                        <AssignmentOutlined color={'secondary'} />
                    Meine Beiträge
                </ButtonBase>
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
                    <div />
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
        <div>Anmelden / Abmelden</div>
    );
});