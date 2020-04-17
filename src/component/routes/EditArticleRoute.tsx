import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { EditArticleLayout } from 'component/layouts/editArticleLayout/EditArticleLayout';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ID } from 'model/ID';

export const EditArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = parseInt(match.params.id);

    const { data, error, loading: isLoading } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, { variables: { id } });

    if (!data || isLoading) {
        return <div><CircularProgress /></div>;
    }
    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }
    if (data) {
        return (
            <EditArticleLayout article={data!.article} />
        );
    }
    return null;
});
export default EditArticleRoute;