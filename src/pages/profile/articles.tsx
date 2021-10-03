import * as React from 'react';
import { ArticleModel } from 'model';
import { Card, CardContent } from '@material-ui/core';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ArticlesList } from 'component/profile/ArticlesList';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getApolloClient } from 'api/client';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

export const Articles = ({
    articles,
    loadArticlesError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <Card>
            <CardContent>
                <h4>Meine Beiträge</h4>
                <ErrorMessage error={error} />
                {articles && <ArticlesList articles={articles} />}
            </CardContent>
        </Card>
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
