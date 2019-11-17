import { ActionCreator, Action } from 'redux';
import { UploadModel } from '../../model';

// Action Types

export enum UserFilesActionType {
    SET_UPLOADS = '[UserFilesAction] set Uploads'
}


// Actions

export type SetUploadsAction = Action<UserFilesActionType.SET_UPLOADS> & { uploads: UploadModel[] };

// Action Creators
export const createSetUploadsAction: ActionCreator<SetUploadsAction> = (upload: UploadModel[]) => ({
    uploads: upload,
    type: UserFilesActionType.SET_UPLOADS
});
