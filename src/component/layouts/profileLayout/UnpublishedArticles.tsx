import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { Card, CardContent, Typography, CircularProgress } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const UnpublishedArticles = memo(() => {
    const { data: unpublishedArticlesData, loading: isLoading, error } = useQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Freizugebene Beiträge</Typography>
                <ErrorMessage error={error} />
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