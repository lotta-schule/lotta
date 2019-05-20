import { createStore, combineReducers, applyMiddleware, Middleware } from 'redux';
import { State } from './State';
import { clientReducer, contentReducer, userReducer } from './reducers';
import { userFilesReducer } from './reducers/userFiles';
import { initialState } from './initialState';
import { composeWithDevTools } from 'redux-devtools-extension';

const composeEnhancers = composeWithDevTools({});

const middleware: Middleware<any, State, any>[] = []; // TODO: add sentry

const store = createStore<State, any, {}, {}>(
    combineReducers<State, any>({
        client: clientReducer,
        content: contentReducer,
        user: userReducer,
        userFiles: userFilesReducer
    }),
    initialState,
    composeEnhancers(
        applyMiddleware(...middleware),
    )
);

export default store;