import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { Card, CardContent, Typography, CircularProgress } from '@material-ui/core';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { useQuery } from 'react-apollo';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';

export const UnpublishedArticles = memo(() => {
    const { data: unpublishedArticlesData, loading: isLoading, error } = useQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Freizugebene Beiträge</Typography>

                {error && (
                    <div style={{ color: 'red' }}>{error.message}</div>
                )}

                {isLoading && (
                    <CircularProgress />
                )}

                {unpublishedArticlesData && unpublishedArticlesData.articles && (
                    <ArticlesManagement articles={unpublishedArticlesData.articles} />
                )}
            </CardContent>
        </Card>
    );
});