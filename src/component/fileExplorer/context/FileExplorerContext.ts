import { createContext, Dispatch } from 'react';
import { FileModel } from 'model';
import { Action } from './reducer';

export const defaultState = {
    files: [] as FileModel[],
    selectedFiles: [] as FileModel[],
    markedFiles: [] as FileModel[],
    currentPath: (() => {
        try {
            return window.localStorage.getItem('lastSelectedFileExplorerPath') || '/';
        } catch {
            return '/';
        }
    })(),
    isPublic: false,
    showActiveUploads: false,
    showCreateNewFolder: false,
    showMoveFiles: false,
    showDeleteFiles: false,
}

const fileExplorerContext = createContext<[typeof defaultState, Dispatch<Action>]>([defaultState, () => { }]);

export const Provider = fileExplorerContext.Provider;
export const Consumer = fileExplorerContext.Consumer;

export default fileExplorerContext;