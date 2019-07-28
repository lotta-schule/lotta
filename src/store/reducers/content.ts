import { ContentState } from '../State';
import { AddArticleAction, AddCategoryAction, UpdateArticleAction, ContentActionType, AddArticlesAction, AddFetchQueryKeyAction } from '../actions/content';
import { groupBy, find } from 'lodash';

export type ContentActions = AddArticleAction | UpdateArticleAction | AddArticlesAction | AddCategoryAction | AddFetchQueryKeyAction;

export const initialContentState: ContentState = {
    articles: [],
    didFetchQueryKeys: []
};

export const contentReducer = (s: ContentState = initialContentState, action: ContentActions): ContentState => {
    switch (action.type) {
        case ContentActionType.ADD_ARTICLE:
            return {
                ...s,
                articles: [...s.articles, action.article]
            };
        case ContentActionType.ADD_ARTICLES:
            const { existingArticles, nonExistingArticles } = groupBy(
                action.articles,
                art => find(s.articles, existingArticle => existingArticle.id === art.id) ? 'existingArticles' : 'nonExistingArticles'
            );
            return {
                ...s,
                articles: [
                    ...(existingArticles ? s.articles.map(article => {
                        return find(existingArticles, existingArticle => existingArticle.id === article.id) || article;
                    }) : s.articles),
                    ...(nonExistingArticles || [])
                ]
            };
        case ContentActionType.ADD_FETCH_QUERY_KEY:
            return {
                ...s,
                didFetchQueryKeys: [...s.didFetchQueryKeys, action.key]
            };
        case ContentActionType.UPDATE_ARTICLE:
            return {
                ...s,
                articles: s.articles.map(article =>
                    article.id === action.article.id ?
                        Object.assign({}, article, action.article) :
                        article
                )
            };
        default:
            return s;
    }
};
