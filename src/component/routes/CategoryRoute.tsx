import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { Query } from 'react-apollo';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const categoryId = match.params.id;
    const category = useCategory(categoryId);
    if (!category) {
        // TODO: redirect to some 404 page
        return null;
    }
    return (
        <Query<{ articles: ArticleModel[] }, { categoryId: string }> query={GetArticlesQuery} variables={{ categoryId }}>
            {({ data, loading: isLoading, error }) => {
                if (!data || isLoading) {
                    return <div><CircularProgress /></div>;
                }
                if (error) {
                    return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
                }
                if (data) {
                    return (
                        <CategoryLayout
                            category={category}
                            articles={data!.articles}
                        />
                    );
                }
            }}
        </Query>
    );
});