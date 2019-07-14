import useReactRouter from 'use-react-router';
import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { ArticleModel } from 'model';

export const useCurrentCategoryId = (): string | null => {
    const { location } = useReactRouter();
    const matchesCategoryUrl = location.pathname.match(/^\/category\/(\d*)/);
    const matchesArticleUrl = location.pathname.match(/^\/article\/(\d*)/);
    const article = useSelector<State, ArticleModel | undefined>(s => matchesArticleUrl ? s.content.articles.find(a => a.id === matchesArticleUrl[1]) : undefined);
    if (article && article.category) {
        return article.category.id;
    }
    if (matchesCategoryUrl) {
        return matchesCategoryUrl[1];
    }
    return null;
}