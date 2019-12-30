import { defaultState } from './FileExplorerContext';
import { FileModel } from '../../../model';

export type Action =
    { type: 'setFiles', files: FileModel[] }
    | { type: 'setSelectedFiles', files: FileModel[] }
    | { type: 'resetSelectedFiles' }
    | { type: 'setMarkedFiles', files: FileModel[] }
    | { type: 'resetMarkedFiles' }
    | { type: 'markSingleFile', file: FileModel }
    | { type: 'setCurrentPath', path: string }
    | { type: 'selectDirectory', directory: string }
    | { type: 'enableIsPublic' }
    | { type: 'disableIsPublic' }
    | { type: 'showActiveUploads' } | { type: 'hideActiveUploads' }
    | { type: 'showCreateNewFolder' } | { type: 'hideCreateNewFolder' }
    | { type: 'showMoveFiles' } | { type: 'hideMoveFiles' }
    | { type: 'showDeleteFiles' } | { type: 'hideDeleteFiles' }

export const reducer = (state: typeof defaultState, action: Action): typeof defaultState => {
    switch (action.type) {
        case 'setFiles':
            return {
                ...state,
                files: action.files
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
        case 'setCurrentPath': {
            return {
                ...state,
                markedFiles: [],
                selectedFiles: [],
                currentPath: action.path
            };
        }
        case 'selectDirectory':
            return {
                ...state,
                markedFiles: [],
                selectedFiles: [],
                currentPath: [state.currentPath, action.directory].join('/').replace(/^\/\//, '/')
            };
        case 'enableIsPublic':
            return {
                ...state,
                markedFiles: [],
                selectedFiles: [],
                currentPath: '/',
                isPublic: true
            }
        case 'disableIsPublic':
            return {
                ...state,
                markedFiles: [],
                selectedFiles: [],
                currentPath: '/',
                isPublic: false
            }
        case 'showActiveUploads':
            return {
                ...state,
                showActiveUploads: true
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
        case 'hideDeleteFiles':
            return {
                ...state,
                showDeleteFiles: false
            }
        default:
            return state;
    }
}