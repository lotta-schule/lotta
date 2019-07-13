import { UserFilesState } from '../State';
import {
    UserFilesActionType,
    SetFilesAction,
    AddFileAction,
    SetUploadsAction,
    DeleteFileAction
} from '../actions/userFiles';
import { mockData } from '../../mockData';

export type UserFilesActions = SetFilesAction | AddFileAction | SetUploadsAction | DeleteFileAction;

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
        case UserFilesActionType.SET_UPLOADS:
            if (action.uploads) {
                return {
                    ...s,
                    uploads: action.uploads
                };
            } else {
                return s;
            }
        default:
            return s;
    }
};
