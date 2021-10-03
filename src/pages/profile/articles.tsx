import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { ArticleModel } from 'model';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ArticlesList } from 'component/profile/ArticlesList';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { getApolloClient } from 'api/client';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

export const Articles = ({
    articles,
    loadArticlesError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <>
            <BaseLayoutMainContent>
                <Card>
                    <CardContent>
                        <h2>Meine Beiträge</h2>
                        <ErrorMessage error={error} />
                        {articles && <ArticlesList articles={articles} />}
                    </CardContent>
                </Card>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
};

export const getServerSideProps = async ({
    req,
}: GetServerSidePropsContext) => {
    const {
        data: { articles },
        error,
    } = await getApolloClient().query<{ articles: ArticleModel[] }>({
        query: GetOwnArticlesQuery,
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

export default Articles;
