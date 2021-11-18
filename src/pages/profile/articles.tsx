import * as React from 'react';
import { getApolloClient } from 'api/client';
import { ArticleModel } from 'model';
import { ArticlesPage } from 'profile/ArticlesPage';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';

import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

const ArticlesRoute = ({
    articles,
    loadArticlesError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return <ArticlesPage articles={articles} error={error} />;
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

export default ArticlesRoute;
