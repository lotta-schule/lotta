import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { createAddArticleAction } from 'store/actions/content';
import { find } from 'lodash';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { PageLayout } from 'component/layouts/PageLayout';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import { State } from 'store/State';
import { useSelector, useDispatch } from 'react-redux';
import React, { memo } from 'react';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = match.params.id;
    const article = useSelector<State, ArticleModel | undefined>(state => find(state.content.articles, { id }));
    const dispatch = useDispatch();
    if (article) {
        return (
            <PageLayout
                title={''}
                articles={[article]}
            />
        );
    }
    return (
        <Query<{ article: ArticleModel }, { id: string }> query={GetArticleQuery} variables={{ id }}>
            {({ data, loading: isLoading, error }) => {
                if (!data || isLoading) {
                    return <div><CircularProgress /></div>;
                }
                if (error) {
                    return (<div><span style={{ color: 'red' }}>{error.message}</span></div>);
                }
                if (data) {
                    dispatch(createAddArticleAction(data.article))
                    return (
                        <PageLayout
                            title={''}
                            articles={[data.article]}
                        />
                    );
                }
            }}
        </Query>
    );
});