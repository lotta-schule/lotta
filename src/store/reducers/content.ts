import { find } from 'lodash';
import { ContentModuleModel } from '../../model';
import { ContentState } from '../State';
import { AddArticleAction, AddCategoryAction, UpdateContentModuleAction, AddContentModuleAction, ContentActionType } from '../actions/content';
import { mockData } from '../../mockData';

export type ContentActions = AddArticleAction | AddCategoryAction | AddContentModuleAction | UpdateContentModuleAction;

export const initialContentState: ContentState = mockData.content;

export const contentReducer = (s: ContentState = initialContentState, action: ContentActions): ContentState => {
    switch (action.type) {
        case ContentActionType.ADD_ARTICLE:
            return {
                ...s,
                articles: [...s.articles, action.article]
            };
        case ContentActionType.ADD_CATEGORY:
            const foundCategory = find(s.articles, { id: action.category.id });
            return foundCategory
                ? {
                    ...s,
                    categories: s.categories.map(category => (category.id === action.category.id ? action.category : category))
                }
                : {
                    ...s,
                    categories: action.category ? s.categories.concat(action.category) : s.categories
                };
        case ContentActionType.ADD_CONTENT_MODULE:
            return {
                ...s,
                articles: s.articles.map(article => ({
                    ...article,
                    modules:
                        article.id === action.articleId
                            ? article.modules.concat([action.contentModule])
                            : article.modules
                }))
            };
        case ContentActionType.UPDATE_CONTENT_MODULE:
            const updateModuleMapFn = (contentModule: ContentModuleModel): ContentModuleModel => {
                if (contentModule.id === action.contentModule.id) {
                    return action.contentModule;
                }
                return contentModule;
            }
            return {
                ...s,
                articles: s.articles.map(page => ({
                    ...page,
                    modules: page.modules.map(updateModuleMapFn)
                }))
            };
        default:
            return s;
    }
};
