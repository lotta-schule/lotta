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
        default:
            return s;
    }
};
