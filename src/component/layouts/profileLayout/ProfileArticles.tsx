import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { Card, CardContent, Typography, CircularProgress } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';

export const ProfileArticles = memo(() => {

    const { data: ownArticlesData, loading: isLoading, error } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Beiträge</Typography>
                <ErrorMessage error={error} />
                {isLoading && (
                    <CircularProgress />
                )}

                {ownArticlesData?.articles && (
                    <ArticlesManagement
                        articles={[...ownArticlesData.articles].sort((a1, a2) =>
                            new Date(a2.updatedAt).getTime() - new Date(a1.updatedAt).getTime()
                        )}
                    />
                )}
            </CardContent>
        </Card>
    );
});