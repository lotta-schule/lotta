import { ActionCreator, Action } from 'redux';
import { ArticleModel, CategoryModel } from '../../model';

// Action Types

export enum ContentActionType {
    ADD_CATEGORY = '[ContentAction] add Category',
    ADD_ARTICLE = '[ContentAction] add Article',
    ADD_CONTENT_MODULE = '[ContentAction] add content module',
    UPDATE_ARTICLE = '[ContentAction] update article'
}

// Actions

export type AddCategoryAction = Action<ContentActionType.ADD_CATEGORY> & { category: CategoryModel };

export type AddArticleAction = Action<ContentActionType.ADD_ARTICLE> & { article: ArticleModel };

export type UpdateArticleAction = Action<ContentActionType.UPDATE_ARTICLE> & { article: ArticleModel };

// Action Creators

export const createAddCategoryAction: ActionCreator<AddCategoryAction> = (category: CategoryModel) => ({
    category,
    type: ContentActionType.ADD_CATEGORY
});

export const createAddArticleAction: ActionCreator<AddArticleAction> = (pageId: string, article: ArticleModel) => ({
    pageId,
    article,
    type: ContentActionType.ADD_ARTICLE
});

export const createUpdateArticleAction: ActionCreator<UpdateArticleAction> = (article: ArticleModel) => ({
    article,
    type: ContentActionType.UPDATE_ARTICLE
});