import React, { memo } from 'react';
import { makeStyles, Theme, Container } from '@material-ui/core';
import { ArticleModel } from 'model';
import { Header } from 'component/general/Header';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';

export interface ArticleTitleProps {
    article: ArticleModel;
    showEditButton?: boolean;
}

const useStyles = makeStyles<Theme>(() => ({
    container: {
        paddingLeft: 0,
        paddingRight: 0,
    },
}));

export const ArticleTitle = memo<ArticleTitleProps>(({ article, showEditButton }) => {
    const styles = useStyles();
    const currentUser = useCurrentUser();

    const showEditSection = showEditButton && (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));
    return (
        <Container className={styles.container}>
            <Header>
                <ArticlePreviewStandardLayout
                    article={article}
                    isEmbedded
                    disableLink
                    disableEdit={!showEditSection}
                    disablePin={!User.isAdmin(currentUser)}
                />
            </Header>
        </Container>
    )
});
