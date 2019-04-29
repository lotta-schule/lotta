import { ActionCreator, Action } from 'redux';
import { PageModel, ArticleModel, ContentModuleModel } from '../../model';

// Action Types

export enum ContentActionType {
    ADD_ARTICLE = '[ContentAction] add Article',
    ADD_PAGE = '[ContentAction] add Page',
    ADD_CONTENT_MODULE = '[ContentAction] add content module',
    UPDATE_CONTENT_MODULE = '[ContentAction] update content module'
}

// Actions

export type AddPageAction = Action<ContentActionType.ADD_PAGE> & { page: PageModel };

export type AddArticleAction = Action<ContentActionType.ADD_ARTICLE> & { pageId: string; article: ArticleModel };

export type AddContentModuleAction = Action<ContentActionType.ADD_CONTENT_MODULE> & { pageId: string; contentModule: ContentModuleModel };

export type UpdateContentModuleAction = Action<ContentActionType.UPDATE_CONTENT_MODULE> & { pageId: string; contentModule: ContentModuleModel };

// Action Creators

export const createAddPageAction: ActionCreator<AddPageAction> = (page: PageModel) => ({
    page,
    type: ContentActionType.ADD_PAGE
});

export const createAddArticleAction: ActionCreator<AddArticleAction> = (pageId: string, article: ArticleModel) => ({
    pageId,
    article,
    type: ContentActionType.ADD_ARTICLE
});

export const createAddContentModuleAction: ActionCreator<AddContentModuleAction> = (pageId: string, contentModule: ContentModuleModel) => ({
    pageId,
    contentModule,
    type: ContentActionType.ADD_CONTENT_MODULE
});

export const createUpdateContentModuleAction: ActionCreator<UpdateContentModuleAction> = (pageId: string, contentModule: ContentModuleModel) => ({
    pageId,
    contentModule,
    type: ContentActionType.UPDATE_CONTENT_MODULE
});
