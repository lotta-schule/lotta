import { ClientActionType, SetClientAction, UpdateClientAction, AddCategoryAction } from '../actions/client';
import { ClientState } from '../State';

export type ClientActions = SetClientAction | UpdateClientAction | AddCategoryAction;

export const initialClientState: ClientState = {
    client: null
};

export const clientReducer = (s: ClientState = initialClientState, action: ClientActions): ClientState => {
    switch (action.type) {
        case ClientActionType.SET_CLIENT:
            return {
                client: (action as SetClientAction).client || null
            };
        case ClientActionType.ADD_CATEGORY:
            return s.client
                ? {
                    client: {
                        ...s.client,
                        categories: s.client.categories.concat([action.category])
                    }
                }
                : s;
        default:
            return s;
    }
};
