import React, { memo } from 'react';
import { ArticleLayout } from 'component/layouts/ArticleLayout';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { ID } from 'model/ID';
import { useQuery } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = Number(match.params.id);
    const { data, loading: isLoading, error } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, { variables: { id } });

    if (isLoading) {
        return <div><CircularProgress /></div>;
    }
    if (error) {
        return (<div><span style={{ color: 'red' }}>{error.message}</span></div>);
    }

    if (data && data.article) {
        return (
            <ArticleLayout
                title={''}
                article={data.article}
            />
        );
    }
    return (
        <span style={{ color: 'red' }}>Keine Daten</span>
    );
});