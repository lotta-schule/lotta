import { ActionCreator, Action } from 'redux';
import { ArticleModel, CategoryModel } from '../../model';

// Action Types

export enum ContentActionType {
    ADD_CATEGORY = '[ContentAction] add Category',
    ADD_ARTICLE = '[ContentAction] add Article',
    ADD_ARTICLES = '[ContentAction] add Articles',
    ADD_FETCH_QUERY_KEY = '[ContentAction] add "fetch query"-key',
    UPDATE_ARTICLE = '[ContentAction] update article'
}

// Actions

export type AddCategoryAction = Action<ContentActionType.ADD_CATEGORY> & { category: CategoryModel };

export type AddArticleAction = Action<ContentActionType.ADD_ARTICLE> & { article: ArticleModel };

export type AddArticlesAction = Action<ContentActionType.ADD_ARTICLES> & { articles: ArticleModel[] };

export type AddFetchQueryKeyAction = Action<ContentActionType.ADD_FETCH_QUERY_KEY> & { key: string };

export type UpdateArticleAction = Action<ContentActionType.UPDATE_ARTICLE> & { article: ArticleModel };

// Action Creators

export const createAddCategoryAction: ActionCreator<AddCategoryAction> = (category: CategoryModel) => ({
    category,
    type: ContentActionType.ADD_CATEGORY
});

export const createAddArticleAction: ActionCreator<AddArticleAction> = (article: ArticleModel) => ({
    article,
    type: ContentActionType.ADD_ARTICLE
});

export const createAddArticlesAction: ActionCreator<AddArticlesAction> = (articles: ArticleModel[]) => ({
    articles,
    type: ContentActionType.ADD_ARTICLES
});

export const createAddFetchQueryKeyAction: ActionCreator<AddFetchQueryKeyAction> = (key: string) => ({
    key,
    type: ContentActionType.ADD_FETCH_QUERY_KEY
});

export const createUpdateArticleAction: ActionCreator<UpdateArticleAction> = (article: ArticleModel) => ({
    article,
    type: ContentActionType.UPDATE_ARTICLE
});