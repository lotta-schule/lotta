import { createContext, Dispatch } from 'react';
import { FileModel } from 'model';
import { Action } from './reducer';

export enum FileExplorerMode {
    ViewAndEdit = 0,
    Select = 10,
    SelectMultiple = 20
}

export const defaultState = {
    mode: FileExplorerMode.ViewAndEdit,
    selectedFiles: [] as FileModel[],
    markedFiles: [] as FileModel[],
    currentPath: [
        { id: null } as any
    ] as ({ id: null } | { id: number; name: string; })[],
    showActiveUploads: false,
    showCreateNewFolder: false,
    showMoveFiles: false,
    showDeleteFiles: false,
}

const fileExplorerContext = createContext<[typeof defaultState, Dispatch<Action>]>([defaultState, () => { }]);

export const Provider = fileExplorerContext.Provider;
export const Consumer = fileExplorerContext.Consumer;

export default fileExplorerContext;