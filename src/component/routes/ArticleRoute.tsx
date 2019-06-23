import { ArticleModel, UpdateArticleModelInput } from 'model';
import { CircularProgress } from '@material-ui/core';
import { createUpdateArticleAction, createAddArticleAction } from 'store/actions/content';
import { EditArticleLayout } from 'component/layouts/EditArticleLayout';
import { find } from 'lodash';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import { State } from 'store/State';
import { useSelector, useDispatch } from 'react-redux';
import { client as apolloClient } from '../../api/client';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import React, { memo } from 'react';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = match.params.id;
    const article = useSelector<State, ArticleModel | undefined>(state => find(state.content.articles, { id }));
    const dispatch = useDispatch();
    const onUpdateArticle = async (article: ArticleModel) => {
        const updateArticleInput = {
            title: article.title,
            preview: article.preview,
            previewImageUrl: article.previewImageUrl,
            pageName: article.pageName,
            contentModules: article.contentModules.map(cm => ({
                type: cm.type,
                text: cm.text,
                sortKey: cm.sortKey
            }))
        }
        const updatedArticle = await apolloClient.mutate<ArticleModel, { id: string, article: UpdateArticleModelInput }>({
            mutation: UpdateArticleMutation,
            variables: {
                id: article.id,
                article: updateArticleInput
            }
        });
        dispatch(createUpdateArticleAction(updatedArticle));
    }
    const onAddArticle = (article: ArticleModel) => dispatch(createAddArticleAction(article));
    if (article) {
        return (
            <EditArticleLayout article={article} onUpdateArticle={onUpdateArticle} />
        );
    }
    return (
        <Query<{ article: ArticleModel }, { id: string }> query={GetArticleQuery} variables={{ id }}>
            {({ data, loading: isLoading, error }) => {
                if (!data || isLoading) {
                    return <div><CircularProgress /></div>;
                }
                if (error) {
                    return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
                }
                if (data) {
                    onAddArticle(data!.article);
                    return (
                        <EditArticleLayout
                            article={data!.article}
                            onUpdateArticle={onUpdateArticle}
                        />
                    );
                }
            }}
        </Query>
    );
});