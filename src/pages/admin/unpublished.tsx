import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { ArticleModel } from 'model';
import { ArticlesList } from 'component/profile/ArticlesList';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getApolloClient } from 'api/client';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { Header } from 'component/general/Header';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';

export const Unpublished = ({
    articles,
    loadArticlesError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <BaseLayoutMainContent>
            <Header bannerImageUrl={'/bannerAdmin.png'}>
                <h2 data-testid="title">freizugebende Beiträge</h2>
            </Header>
            <ErrorMessage error={error} />

            <Card>
                <CardContent>
                    {articles && <ArticlesList articles={articles} />}
                </CardContent>
            </Card>
        </BaseLayoutMainContent>
    );
};

export const getServerSideProps = async ({
    req,
}: GetServerSidePropsContext) => {
    const {
        data: { articles },
        error,
    } = await getApolloClient().query<{ articles: ArticleModel[] }>({
        query: GetUnpublishedArticlesQuery,
        context: {
            headers: req?.headers,
        },
    });

    return {
        props: {
            articles,
            loadArticlesError: error ?? null,
        },
    };
};

export default Unpublished;
