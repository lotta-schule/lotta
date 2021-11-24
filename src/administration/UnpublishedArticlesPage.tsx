import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { ArticleModel } from 'model';
import { Header, Main, Sidebar } from 'layout';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { ArticlesList } from 'shared/articlesList/ArticlesList';

export interface UnpublishedArticlesPageProps {
    articles: ArticleModel[];
    error?: Error | null;
}

export const UnpublishedArticlesPage = React.memo<UnpublishedArticlesPageProps>(
    ({ articles, error }) => {
        return (
            <>
                <Main>
                    <Header bannerImageUrl={'/bannerAdmin.png'}>
                        <h2 data-testid="title">freizugebende Beiträge</h2>
                    </Header>
                    <ErrorMessage error={error} />

                    <Card>
                        <CardContent>
                            {articles && <ArticlesList articles={articles} />}
                        </CardContent>
                    </Card>
                </Main>
                <Sidebar isEmpty />
            </>
        );
    }
);
UnpublishedArticlesPage.displayName = 'AdminUnpublishedArticlesPage';
