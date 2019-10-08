import useReactRouter from 'use-react-router';
import { ArticleModel } from 'model';
import { ID } from 'model/ID';
import { useQuery } from '@apollo/react-hooks';
import { GetArticleQuery } from 'api/query/GetArticleQuery';

export const useCurrentCategoryId = (): ID | null => {
    const { location } = useReactRouter();
    const matchesCategoryUrl = location.pathname.match(/^\/category\/(\d*)/);
    const matchesArticleUrl = location.pathname.match(/^\/article\/(\d*)/);
    const { data } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, {
        variables: matchesArticleUrl ? { id: Number(matchesArticleUrl![1]) } : { id: 0 },
        skip: !matchesArticleUrl || matchesArticleUrl.length < 2
    });
    if (matchesCategoryUrl) {
        return Number(matchesCategoryUrl[1]);
    } else if (matchesArticleUrl) {
        if (data && data.article && data.article.category) {
            return data.article.category.id;
        }
    }
    return null;
}