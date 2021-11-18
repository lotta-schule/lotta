import * as React from 'react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { ArticleModel, ID } from 'model';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { getApolloClient } from 'api/client';
import { useQuery } from '@apollo/client';
import { Main, Sidebar } from 'layout';
import { EditArticlePage } from 'article/EditArticlePage';

import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

const EditArticleRoute = ({
    article,
    loadArticleError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    if (!article) {
        throw new Error('Article is not valid.');
    }
    const didWriteClient = React.useRef(false);
    if (!didWriteClient.current) {
        getApolloClient().writeQuery({
            query: GetArticleQuery,
            variables: { id: article.id },
            data: { article },
        });
        didWriteClient.current = true;
    }

    const { data } = useQuery(GetArticleQuery, {
        variables: { id: article.id },
    });

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <>
            <Main>
                <EditArticlePage article={data?.article ?? article} />
            </Main>
            <Sidebar isEmpty />
        </>
    );
};

export const getServerSideProps = async ({
    params,
    req,
}: GetServerSidePropsContext) => {
    if ((req as any).tenant === null) {
        return { props: {} };
    }
    const articleId = (params?.slug as string)?.replace(/^(\d+).*/, '$1');
    if (!articleId) {
        return {
            props: {
                article: null,
                loadArticleError: null,
            },
            notFound: true,
        };
    }
    const {
        data: { article },
        error: loadArticleError,
    } = await getApolloClient().query<{ article: ArticleModel }, { id: ID }>({
        query: GetArticleQuery,
        variables: { id: articleId },
        context: {
            headers: req?.headers,
        },
    });

    return {
        props: {
            article,
            loadArticleError: loadArticleError ?? null,
        },
        notFound: !article,
    };
};

export default EditArticleRoute;
