import { UserFilesState } from '../State';
import {
    UserFilesActionType,
    SetFilesAction,
    AddFileAction,
    AddUploadAction,
    UpdateUploadAction,
    DeleteUploadAction,
    DeleteFileAction
} from '../actions/userFiles';
import { mockData } from '../../mockData';

export type UserFilesActions = SetFilesAction | AddFileAction | DeleteFileAction | AddUploadAction | UpdateUploadAction | DeleteUploadAction;

export const initialUserFilesState: UserFilesState = mockData.userFiles;

export const userFilesReducer = (s: UserFilesState = initialUserFilesState, action: UserFilesActions): UserFilesState => {
    switch (action.type) {
        case UserFilesActionType.SET_FILES: {
            const currentAction = action as SetFilesAction;
            return {
                ...s,
                files: currentAction.files
            };
        }
        case UserFilesActionType.ADD_FILE:
            return {
                ...s,
                files: [...(s.files || []), action.file]
            };
        case UserFilesActionType.DELETE_FILE:
            return {
                ...s,
                files: (s.files || []).filter(f => f.id !== action.id)
            };
        case UserFilesActionType.ADD_UPLOAD:
            return {
                ...s,
                uploads: [
                    ...s.uploads,
                    action.upload
                ]
            };
        case UserFilesActionType.UPDATE_UPLOAD:
            return {
                ...s,
                uploads: s.uploads.map(upload => {
                    if (upload.id === action.upload.id) {
                        return action.upload;
                    } else {
                        return upload;
                    }
                })
            };
        case UserFilesActionType.DELETE_UPLOAD:
            return {
                ...s,
                uploads: s.uploads.filter(upload => upload.id !== action.id)
            };
        default:
            return s;
    }
};
