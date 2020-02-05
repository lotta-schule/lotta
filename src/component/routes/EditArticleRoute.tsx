import { ArticleModel, ArticleModelInput } from 'model';
import React, { memo } from 'react';
import useRouter from 'use-react-router';
import { CircularProgress } from '@material-ui/core';
import { omit } from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { EditArticleLayout } from 'component/layouts/editArticleLayout/EditArticleLayout';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ID } from 'model/ID';

export const EditArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = parseInt(match.params.id);

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
        return (
            <ErrorMessage error={error} />
        );
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
                                ...omit(article, ['id'])
                            } as ArticleModelInput
                        },
                    });
                }}
            />
        );
    }
    return null;
});
