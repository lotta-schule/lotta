import React, { memo } from 'react';
import { makeStyles, Theme, Container } from '@material-ui/core';
import { ArticleModel } from 'model';
import { Header } from 'component/general/Header';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';

export interface ArticleTitleProps {
    article: ArticleModel;
}

const useStyles = makeStyles<Theme>(theme => ({
    container: {
        paddingLeft: 0,
        paddingRight: 0,
    },
}));

export const ArticleTitle = memo<ArticleTitleProps>(({ article }) => {
    const styles = useStyles();
    const currentUser = useCurrentUser();

    const showEditSection = (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));
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
