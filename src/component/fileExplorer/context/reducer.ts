import { defaultState } from './FileExplorerContext';
import { FileModel, DirectoryModel, ID } from '../../../model';

export type Action =
    | { type: 'setMode', mode: typeof defaultState.mode }
    | { type: 'setSelectedFiles', files: FileModel[] }
    | { type: 'resetSelectedFiles' }
    | { type: 'setMarkedFiles', files: FileModel[] }
    | { type: 'resetMarkedFiles' }
    | { type: 'markSingleFile', file: FileModel }
    | { type: 'setMarkedDirectories', directories: DirectoryModel[] }
    | { type: 'resetMarkedDirectories' }
    | { type: 'markSingleDirectory', directory: DirectoryModel }
    | { type: 'setPath', path: ({ id: null } | { id: ID; name: string })[] }
    | { type: 'setSearchFilter', searchtext: string }
    | { type: 'showActiveUploads' } | { type: 'hideActiveUploads' }
    | { type: 'showFileUsage' } | { type: 'hideFileUsage' }
    | { type: 'showCreateNewFolder' } | { type: 'hideCreateNewFolder' }
    | { type: 'showMoveFiles' } | { type: 'hideMoveFiles' }
    | { type: 'showMoveDirectory' } | { type: 'hideMoveDirectory' }
    | { type: 'showDeleteFiles' } | { type: 'hideDeleteFiles' }
    | { type: 'toggleDetailSidebarEnabled' }

export const reducer = (state: typeof defaultState, action: Action): typeof defaultState => {
    switch (action.type) {
        case 'setMode':
            return {
                ...state,
                mode: action.mode
            };
        case 'setSelectedFiles':
            return {
                ...state,
                selectedFiles: action.files
            };
        case 'resetSelectedFiles':
            return {
                ...state,
                selectedFiles: []
            };
        case 'setMarkedFiles':
            return {
                ...state,
                markedFiles: action.files
            };
        case 'resetMarkedFiles':
            return {
                ...state,
                markedFiles: []
            };
        case 'markSingleFile':
            return {
                ...state,
                markedFiles: [action.file]
            }
        case 'setMarkedDirectories':
            return {
                ...state,
                markedDirectories: action.directories
            };
        case 'resetMarkedDirectories':
            return {
                ...state,
                markedDirectories: []
            };
        case 'markSingleDirectory':
            return {
                ...state,
                markedDirectories: [action.directory]
            }
        case 'setPath':
            return {
                ...state,
                markedFiles: [],
                selectedFiles: [],
                currentPath: [...action.path],
                searchtext: '',
            };
        case 'setSearchFilter':
            return {
                ...state,
                searchtext: action.searchtext
            }
        case 'showActiveUploads':
            return {
                ...state,
                showActiveUploads: true
            }
        case 'showFileUsage':
            return {
                ...state,
                showFileUsage: true
            }
        case 'showCreateNewFolder':
            return {
                ...state,
                showCreateNewFolder: true
            }
        case 'showMoveFiles':
            return {
                ...state,
                showMoveFiles: true
            }
        case 'showMoveDirectory':
            return {
                ...state,
                showMoveDirectory: true
            }
        case 'showDeleteFiles':
            return {
                ...state,
                showDeleteFiles: true
            }
        case 'hideActiveUploads':
            return {
                ...state,
                showActiveUploads: false
            }
        case 'hideFileUsage':
            return {
                ...state,
                showFileUsage: false
            }
        case 'hideCreateNewFolder':
            return {
                ...state,
                showCreateNewFolder: false
            }
        case 'hideMoveFiles':
            return {
                ...state,
                showMoveFiles: false
            }
        case 'hideMoveDirectory':
            return {
                ...state,
                showMoveDirectory: false
            }
        case 'hideDeleteFiles':
            return {
                ...state,
                showDeleteFiles: false
            }
        case 'toggleDetailSidebarEnabled':
            return {
                ...state,
                detailSidebarEnabled: !state.detailSidebarEnabled
            }
        default:
            return state;
    }
}
