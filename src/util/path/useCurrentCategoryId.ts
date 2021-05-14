import { ArticleModel } from 'model';
import { ID } from 'model/ID';
import { useQuery } from '@apollo/client';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { useLocation } from 'react-router-dom';

export const useCurrentCategoryId = (): ID | null => {
    const location: Location | { location: Location } = useLocation() as any;
    const { pathname } =
        (location as { location: Location }).location ?? location;
    const matchesCategoryUrl = pathname?.match(/^\/c(?:ategory)?\/(\d*)/);
    const matchesArticleUrl = pathname?.match(/^\/a(?:rticle)?\/(\d*)/);
    const { data } = useQuery<{ article: ArticleModel }, { id: ID }>(
        GetArticleQuery,
        {
            variables: matchesArticleUrl
                ? { id: matchesArticleUrl![1] }
                : null!,
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
