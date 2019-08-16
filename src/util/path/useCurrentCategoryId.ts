import useReactRouter from 'use-react-router';
import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { ArticleModel } from 'model';
import { ID } from 'model/ID';

export const useCurrentCategoryId = (): ID | null => {
    const { location } = useReactRouter();
    const matchesCategoryUrl = location.pathname.match(/^\/category\/(\d*)/);
    const matchesArticleUrl = location.pathname.match(/^\/article\/(\d*)/);
    const article = useSelector<State, ArticleModel | undefined>(s => matchesArticleUrl ? s.content.articles.find(a => a.id === Number(matchesArticleUrl[1])) : undefined);
    if (article && article.category) {
        return article.category.id;
    }
    if (matchesCategoryUrl) {
        return Number(matchesCategoryUrl[1]);
    }
    return null;
}