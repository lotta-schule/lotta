import { ActionCreator, Action } from 'redux';
import { CategoryModel, ClientModel } from '../../model';

// Action Types

export enum ClientActionType {
    SET_CLIENT = '[ClientAction] set client',
    UPDATE_CLIENT = '[ClientAction] update client',
    SET_CATEGORIES = '[ClientAction] set categories',
    ADD_CATEGORY = '[ClientAction] add category',
    UPDATE_CATEGORY = '[ClientAction] update category'
}

// Actions
export type SetClientAction = Action<ClientActionType.SET_CLIENT> & { client: ClientModel };
export type UpdateClientAction = Action<ClientActionType.UPDATE_CLIENT> & { client: ClientModel };
export type AddCategoryAction = Action<ClientActionType.ADD_CATEGORY> & { category: CategoryModel };
export type SetCategoriesAction = Action<ClientActionType.SET_CATEGORIES> & { categories: CategoryModel[] };
export type UpdateCategoryAction = Action<ClientActionType.UPDATE_CATEGORY> & { category: CategoryModel };

// Action Creators

export const createSetClientAction: ActionCreator<SetClientAction> = (client: ClientModel) => ({
    client,
    type: ClientActionType.SET_CLIENT
});

export const createUpdateClientAction: ActionCreator<UpdateClientAction> = (client: ClientModel) => ({
    client,
    type: ClientActionType.UPDATE_CLIENT
});

export const createAddCategoryAction: ActionCreator<AddCategoryAction> = (category: CategoryModel) => ({
    category,
    type: ClientActionType.ADD_CATEGORY
});

export const createSetCategoriesAction: ActionCreator<SetCategoriesAction> = (categories: CategoryModel[]) => ({
    categories,
    type: ClientActionType.SET_CATEGORIES
});

export const createUpdateCategoryAction: ActionCreator<UpdateCategoryAction> = (category: CategoryModel) => ({
    category,
    type: ClientActionType.UPDATE_CATEGORY
});
