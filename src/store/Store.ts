import { createStore, combineReducers } from "redux";
import { State } from "./State";
import { clientReducer, contentReducer, userReducer } from "./reducers";
import { userFilesReducer } from "./reducers/userFiles";
import { initialState } from "./initialState";

const store = createStore<State, any, {}, {}>(
    combineReducers<State, any>({
        client: clientReducer,
        content: contentReducer,
        user: userReducer,
        userFiles: userFilesReducer
    }),
    initialState
);

export default store;