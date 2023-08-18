import * as React from 'react';
import { FileModel, DirectoryModel, ID } from 'model';
import { Action } from './reducer';

export enum FileExplorerMode {
    ViewAndEdit = 0,
    Select = 10,
    SelectMultiple = 20,
}

export type Path = ({ id: null } | { id: ID; name: string })[];

export const defaultState = {
    mode: FileExplorerMode.ViewAndEdit,
    selectedFiles: [] as FileModel[],
    markedFiles: [] as FileModel[],
    markedDirectories: [] as DirectoryModel[],
    currentPath: [{ id: null } as any] as Path,
    searchtext: '',
    showActiveUploads: false,
    showFileUsage: false,
    showCreateNewFolder: false,
    showMoveFiles: false,
    showMoveDirectory: false,
    showDeleteFiles: false,
    detailSidebarEnabled: false,
};

const fileExplorerContext = React.createContext<
    [typeof defaultState, React.Dispatch<Action>]
>([defaultState, () => {}]);

export const Provider = fileExplorerContext.Provider;
export const Consumer = fileExplorerContext.Consumer;

export default fileExplorerContext;
