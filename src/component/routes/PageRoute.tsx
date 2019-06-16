import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Query } from 'react-apollo';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { GetPageQuery } from 'api/query/GetPageQuery';
import { PageLayout } from 'component/layouts/PageLayout';

export const PageRoute = memo<RouteComponentProps<{ name: string }>>(({ match }) => {
    const name = match.params.name;
    return (
        <Query<{ page: ArticleModel[] }, { name: string }> query={GetPageQuery} variables={{ name }}>
            {({ data, loading: isLoading, error }) => {
                if (!data || isLoading) {
                    return <div><CircularProgress /></div>;
                }
                if (error) {
                    return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
                }
                if (data) {
                    return (
                        <PageLayout
                            title={name}
                            articles={data!.page}
                        />
                    );
                }
            }}
        </Query>
    );
});