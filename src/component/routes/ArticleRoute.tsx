import React, { memo } from 'react';
import { ArticleLayout } from 'component/layouts/ArticleLayout';
import { ArticleModel } from 'model';
import { CircularProgress } from '@material-ui/core';
import { createAddArticleAction } from 'store/actions/content';
import { find } from 'lodash';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { ID } from 'model/ID';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import { State } from 'store/State';
import { useSelector, useDispatch } from 'react-redux';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = Number(match.params.id);
    const article = useSelector<State, ArticleModel | undefined>(state => find(state.content.articles, { id }));
    const dispatch = useDispatch();
    if (article) {
        return (
            <ArticleLayout
                title={''}
                article={article}
            />
        );
    }
    return (
        <Query<{ article: ArticleModel }, { id: ID }> query={GetArticleQuery} variables={{ id }}>
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
                        <ArticleLayout
                            title={''}
                            article={data.article}
                        />
                    );
                }
                return null;
            }}
        </Query>
    );
});