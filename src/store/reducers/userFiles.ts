import { UserFilesState } from '../State';
import { SetUploadsAction, UserFilesActionType } from '../actions/userFiles';

export type UserFilesActions = SetUploadsAction;

export const initialUserFilesState: UserFilesState = {
    uploads: []
};

export const userFilesReducer = (s: UserFilesState = initialUserFilesState, action: UserFilesActions): UserFilesState => {
    switch (action.type) {
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
