import * as React from 'react';
import { Box } from 'shared/general/layout/Box';
import { ArticleModel } from 'model';
import { Header, Main, Sidebar } from 'layout';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { ArticlesList } from 'shared/articlesList/ArticlesList';

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

                    <Box>
                        <ErrorMessage error={error} />
                        {articles && <ArticlesList articles={articles} />}
                    </Box>
                </Main>
                <Sidebar isEmpty />
            </>
        );
    }
);
ArticlesPage.displayName = 'ProfileArticlesPage';
