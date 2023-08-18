import { ArticleModel } from 'model';
import { ID } from 'model/ID';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export const useCurrentCategoryId = (): ID | null => {
  const router = useRouter();
  const path = router.asPath;
  const matchesCategoryUrl = path?.match(/^\/c?\/(\d*)/);
  const matchesArticleUrl = path?.match(/^\/a?\/(\d*)/);
  const { data } = useQuery<{ article: ArticleModel }, { id: ID }>(
    GetArticleQuery,
    {
      variables: matchesArticleUrl ? { id: matchesArticleUrl![1] } : null!,
      skip: !matchesArticleUrl || matchesArticleUrl.length < 2,
    }
  );
  if (matchesCategoryUrl) {
    return matchesCategoryUrl[1];
  } else if (matchesArticleUrl) {
    if (data && data.article && data.article.category) {
      return data.article.category.id;
    }
  }
  return null;
};
