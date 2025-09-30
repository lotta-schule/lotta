import * as React from 'react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { ArticleModel, ID } from 'model';
import { ErrorMessage } from '@lotta-schule/hubert';
import { getApolloClient } from 'api/legacyClient';
import { useQuery } from '@apollo/client';
import { Main, Sidebar } from 'layout';
import { EditArticlePageProps } from 'article/EditArticlePage';
import { Article, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

const DynamicEditArticlePage = dynamic<EditArticlePageProps>(
  () => import('article/EditArticlePage'),
  {
    ssr: false,
  }
);

const EditArticleRoute = ({
  article,
  loadArticleError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (!article) {
    throw new Error('Article is not valid.');
  }
  const router = useRouter();
  const currentUser = useCurrentUser();
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
  const canEditArticle =
    User.canEditArticle(currentUser, article) || User.isAdmin(currentUser);

  React.useEffect(() => {
    if (!canEditArticle) {
      router.push(Article.getPath(article));
    }
  }, [canEditArticle, router, article]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!canEditArticle) {
    return null;
  }

  return (
    <>
      <Main>
        <DynamicEditArticlePage article={data?.article ?? article} />
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
