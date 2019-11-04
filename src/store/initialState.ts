import { initialClientState } from './reducers';
import { initialContentState } from './reducers/content';
import { initialUserFilesState } from './reducers/userFiles';
import { initialLayoutState } from './reducers/layout';
import { State } from './State';

export const initialState: State = {
    client: initialClientState,
    content: initialContentState,
    layout: initialLayoutState,
    userFiles: initialUserFilesState
};
