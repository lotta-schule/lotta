import * as React from 'react';
import { Container } from '@material-ui/core';
import { ArticleModel } from 'model';
import { Header } from 'component/general/Header';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';

export interface ArticleTitleProps {
    article: ArticleModel;
    onUpdate?: (article: ArticleModel) => void;
}

export const ArticleTitle = React.memo<ArticleTitleProps>(
    ({ article, onUpdate }) => {
        const currentUser = useCurrentUser();

        const showEditSection =
            !onUpdate &&
            (User.canEditArticle(currentUser, article) ||
                User.isAdmin(currentUser));
        return (
            <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Header>
                    <ArticlePreviewStandardLayout
                        article={article}
                        isEmbedded
                        disableLink
                        onUpdateArticle={onUpdate}
                        disableEdit={!showEditSection}
                        disablePin={!User.isAdmin(currentUser)}
                    />
                </Header>
            </Container>
        );
    }
);
ArticleTitle.displayName = 'ArticleTitle';
