import { createContext, Dispatch } from 'react';
import { FileModel, DirectoryModel, ID } from 'model';
import { Action } from './reducer';

export enum FileExplorerMode {
    ViewAndEdit = 0,
    Select = 10,
    SelectMultiple = 20,
}

export const defaultState = {
    mode: FileExplorerMode.ViewAndEdit,
    selectedFiles: [] as FileModel[],
    markedFiles: [] as FileModel[],
    markedDirectories: [] as DirectoryModel[],
    currentPath: [{ id: null } as any] as (
        | { id: null }
        | { id: ID; name: string }
    )[],
    searchtext: '',
    showActiveUploads: false,
    showFileUsage: false,
    showCreateNewFolder: false,
    showMoveFiles: false,
    showMoveDirectory: false,
    showDeleteFiles: false,
    detailSidebarEnabled: false,
};

const fileExplorerContext = createContext<
    [typeof defaultState, Dispatch<Action>]
>([defaultState, () => {}]);

export const Provider = fileExplorerContext.Provider;
export const Consumer = fileExplorerContext.Consumer;

export default fileExplorerContext;
