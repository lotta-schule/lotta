import { ArticleModel, ArticleModelInput } from 'model';
import { CircularProgress } from '@material-ui/core';
import { EditArticleLayout } from 'component/layouts/EditArticleLayout';
import { omit } from 'lodash';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { useQuery, useMutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import React, { memo } from 'react';
import { ID } from 'model/ID';
import useRouter from 'use-react-router';

export const EditArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = Number(match.params.id);

    const { history } = useRouter();
    const { data, error, loading: isLoading } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, { variables: { id } });
    const [saveArticle] = useMutation<{ article: ArticleModel }, { id: ID, article: ArticleModelInput }>(UpdateArticleMutation, {
        onCompleted: ({ article }) => {
            if (article) {
                history.push(`/article/${article.id}`);
            }
        }
    });

    if (!data || isLoading) {
        return <div><CircularProgress /></div>;
    }
    if (error) {
        return <div><span style={{ color: 'red' }}>{error.message}</span></div>;
    }
    if (data) {
        return (
            <EditArticleLayout
                article={data!.article}
                onUpdateArticle={(article: ArticleModel) => {
                    saveArticle({
                        variables: {
                            id: article.id,
                            article: {
                                ...omit(article, ['id', 'updatedAt']),
                                contentModules: article.contentModules.map(cm => omit(cm, ['id']))
                            } as ArticleModelInput
                        },
                    });
                }}
            />
        );
    }
    return null;
});