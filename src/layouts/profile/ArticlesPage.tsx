import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { ArticleModel } from 'model';
import { Header, Main, Sidebar } from 'layouts/base';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ArticlesList } from 'component/profile/ArticlesList';

export interface ArticlesPageProps {
    articles: ArticleModel[];
    error?: Error | null;
}

export const ArticlesPage = React.memo<ArticlesPageProps>(
    ({ articles, error }) => {
        return (
            <>
                <Main>
                    <Header bannerImageUrl={'/bannerProfil.png'}>
                        <h2>Meine Beiträge</h2>
                    </Header>

                    <Card>
                        <CardContent>
                            <ErrorMessage error={error} />
                            {articles && <ArticlesList articles={articles} />}
                        </CardContent>
                    </Card>
                </Main>
                <Sidebar isEmpty />
            </>
        );
    }
);
ArticlesPage.displayName = 'ProfileArticlesPage';
