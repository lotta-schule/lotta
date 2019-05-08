import { ActionCreator, Action } from 'redux';
import { ArticleModel, ContentModuleModel, CategoryModel } from '../../model';

// Action Types

export enum ContentActionType {
    ADD_CATEGORY = '[ContentAction] add Category',
    ADD_ARTICLE = '[ContentAction] add Article',
    ADD_CONTENT_MODULE = '[ContentAction] add content module',
    UPDATE_CONTENT_MODULE = '[ContentAction] update content module'
}

// Actions

export type AddCategoryAction = Action<ContentActionType.ADD_CATEGORY> & { category: CategoryModel };

export type AddArticleAction = Action<ContentActionType.ADD_ARTICLE> & { article: ArticleModel };

export type AddContentModuleAction = Action<ContentActionType.ADD_CONTENT_MODULE> & { articleId: string; contentModule: ContentModuleModel };

export type UpdateContentModuleAction = Action<ContentActionType.UPDATE_CONTENT_MODULE> & { articleId: string; contentModule: ContentModuleModel };

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

export const createAddContentModuleAction: ActionCreator<AddContentModuleAction> = (articleId: string, contentModule: ContentModuleModel) => ({
    articleId,
    contentModule,
    type: ContentActionType.ADD_CONTENT_MODULE
});

export const createUpdateContentModuleAction: ActionCreator<UpdateContentModuleAction> = (articleId: string, contentModule: ContentModuleModel) => ({
    articleId,
    contentModule,
    type: ContentActionType.UPDATE_CONTENT_MODULE
});
