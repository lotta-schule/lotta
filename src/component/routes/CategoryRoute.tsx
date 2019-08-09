import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { Query } from 'react-apollo';
import { ArticleModel } from 'model';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'store/State';
import { createAddArticlesAction, createAddFetchQueryKeyAction } from 'store/actions/content';
import { EmptyLoadingLayout } from 'component/layouts/EmptyLoadingLayout';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const categoryId = match.params.id;
    const category = useCategory(categoryId);
    const dispatch = useDispatch();
    const fetchQueryKey = `category_${categoryId}_articles`;
    const articles = useSelector<State, ArticleModel[]>(s =>
        categoryId ? s.content.articles.filter(a => a.category && a.category.id === categoryId) : s.content.articles
    );
    const didFetchCategoryArticles = useSelector<State, boolean>(s => s.content.didFetchQueryKeys.indexOf(fetchQueryKey) > -1);


    if (didFetchCategoryArticles) {
        return (
            <CategoryLayout
                category={category}
                articles={articles}
            />
        );
    } else {
        return (
            <Query<{ articles: ArticleModel[] }, { categoryId: string }> query={GetArticlesQuery} variables={{ categoryId }}>
                {({ data, loading: isLoading, error }) => {
                    if (!data || isLoading) {
                        return <EmptyLoadingLayout />;
                    }
                    if (error) {
                        return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
                    }
                    if (data) {
                        dispatch(createAddFetchQueryKeyAction(fetchQueryKey));
                        dispatch(createAddArticlesAction(data.articles));
                        return null;
                    }
                    return null;
                }}
            </Query>
        );
    }
});