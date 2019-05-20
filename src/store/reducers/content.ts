import { find } from 'lodash';
import { ContentState } from '../State';
import { AddArticleAction, AddCategoryAction, UpdateArticleAction, ContentActionType } from '../actions/content';
import { mockData } from '../../mockData';

export type ContentActions = AddArticleAction | UpdateArticleAction | AddCategoryAction;

export const initialContentState: ContentState = mockData.content;

export const contentReducer = (s: ContentState = initialContentState, action: ContentActions): ContentState => {
    switch (action.type) {
        case ContentActionType.ADD_ARTICLE:
            return {
                ...s,
                articles: [...s.articles, action.article]
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
        case ContentActionType.ADD_CATEGORY:
            const foundCategory = find(s.articles, { id: action.category.id });
            return foundCategory
                ? {
                    ...s,
                    categories: s.categories.map(category => (category.id === action.category.id ? Object.assign({}, category, action.category) : category))
                }
                : {
                    ...s,
                    categories: action.category ? s.categories.concat(action.category) : s.categories
                };
        default:
            return s;
    }
};
