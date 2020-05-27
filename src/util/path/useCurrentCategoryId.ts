import { ArticleModel } from 'model';
import { ID } from 'model/ID';
import { useQuery } from '@apollo/client';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import useRouter from 'use-react-router';

export const useCurrentCategoryId = (): ID | null => {
    const { location } = useRouter();
    const matchesCategoryUrl = location.pathname.match(/^\/c(?:ategory)?\/(\d*)/);
    const matchesArticleUrl = location.pathname.match(/^\/a(?:rticle)?\/(\d*)/);
    const { data } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, {
        variables: matchesArticleUrl ? { id: Number(matchesArticleUrl![1]) } : null!,
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
