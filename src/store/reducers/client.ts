import { ClientActionType, SetClientAction, UpdateClientAction, AddCategoryAction, SetCategoriesAction } from '../actions/client';
import { ClientState } from '../State';

export type ClientActions = SetClientAction | UpdateClientAction | AddCategoryAction | SetCategoriesAction;

export const initialClientState: ClientState = {
    client: null,
    categories: []
};

export const clientReducer = (s: ClientState = initialClientState, action: ClientActions): ClientState => {
    switch (action.type) {
        case ClientActionType.SET_CLIENT:
            return {
                ...s,
                client: action.client || null
            };
        case ClientActionType.SET_CATEGORIES:
            return {
                ...s,
                categories: action.categories
            }
        case ClientActionType.ADD_CATEGORY:
            return {
                ...s,
                categories: [...s.categories, action.category]
            }
        default:
            return s;
    }
};
