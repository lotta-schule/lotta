import { initialClientState } from './reducers';
import { initialContentState } from './reducers/content';
import { initialUserFilesState } from './reducers/userFiles';
import { initialUserState } from './reducers/user';
import { initialLayoutState } from './reducers/layout';
import { State } from './State';

export const initialState: State = {
    client: initialClientState,
    content: initialContentState,
    user: initialUserState,
    userFiles: initialUserFilesState,
    layout: initialLayoutState
};
