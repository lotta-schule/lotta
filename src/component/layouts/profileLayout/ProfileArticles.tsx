import React, { memo } from 'react';
import { ArticleModel } from 'model';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
} from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ArticlesList } from 'component/profile/ArticlesList';

export const ProfileArticles = memo(() => {
    const { data, loading: isLoading, error } = useQuery<{
        articles: ArticleModel[];
    }>(GetOwnArticlesQuery);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Beiträge</Typography>
                <ErrorMessage error={error} />
                {isLoading && <CircularProgress />}

                {data?.articles && <ArticlesList articles={data.articles} />}
            </CardContent>
        </Card>
    );
});
