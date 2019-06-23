import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { Query } from 'react-apollo';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'store/State';
import { createAddArticleAction } from 'store/actions/content';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const categoryId = match.params.id;
    const category = useCategory(categoryId);
    const dispatch = useDispatch();
    const articles = useSelector<State, ArticleModel[]>(s => s.content.articles.filter(a => a.category && a.category.id === categoryId));
    if (!category) {
        // TODO: redirect to some 404 page
        return null;
    }
    if (articles && articles.length > 0) {
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
                        return <div><CircularProgress /></div>;
                    }
                    if (error) {
                        return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
                    }
                    if (data) {
                        const articles = data.articles;
                        articles.map(article => dispatch(createAddArticleAction(article)));
                        return (
                            <CategoryLayout
                                category={category}
                                articles={articles}
                            />
                        );
                    }
                }}
            </Query>
        );
    }
});