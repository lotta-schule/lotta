import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { Card, CardContent, Typography, CircularProgress } from '@material-ui/core';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { useQuery } from 'react-apollo';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';

export const ProfileArticles = memo(() => {

    const { data: ownArticlesData, loading: isLoading, error } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Beiträge</Typography>

                {error && (
                    <div style={{ color: 'red' }}>{error.message}</div>
                )}

                {isLoading && (
                    <CircularProgress />
                )}

                {ownArticlesData && ownArticlesData.articles && (
                    <ArticlesManagement articles={ownArticlesData.articles} />
                )}
            </CardContent>
        </Card>
    );
});