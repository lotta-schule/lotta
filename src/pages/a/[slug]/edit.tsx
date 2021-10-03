import * as React from 'react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { ArticleModel } from 'model';
import { ID } from 'model/ID';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { getApolloClient } from 'api/client';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { EditArticleLayout } from 'component/layouts/editArticleLayout/EditArticleLayout';
import { useQuery } from '@apollo/client';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export const EditArticleRoute = ({
    article,
    loadArticleError,
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

    if (loadArticleError) {
        return <ErrorMessage error={loadArticleError} />;
    }

    return (
        <>
            <BaseLayoutMainContent>
                <EditArticleLayout article={data.article} />
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
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
