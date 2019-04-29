import { ActionCreator, Action } from 'redux';
import { FileModel, UploadModel } from '../../model';

// Action Types

export enum UserFilesActionType {
    SET_FILES = '[UserFilesAction] set Files',
    ADD_FILE = '[UserFilesAction] add File',
    DELETE_FILE = '[UserFilesAction] delete File',
    SET_UPLOADS = '[UserFilesAction] set Uploads'
}


// Actions

export type AddFileAction = Action<UserFilesActionType.ADD_FILE> & { file: FileModel };

export type SetFilesAction = Action<UserFilesActionType.SET_FILES> & { files: FileModel[] };

export type DeleteFileAction = Action<UserFilesActionType.DELETE_FILE> & { id: string };

export type SetUploadsAction = Action<UserFilesActionType.SET_UPLOADS> & { uploads: UploadModel[] };

// Action Creators

export const createAddFileAction: ActionCreator<AddFileAction> = (file: FileModel) => ({
    file,
    type: UserFilesActionType.ADD_FILE
});

export const createSetFilesAction: ActionCreator<SetFilesAction> = (files: FileModel[]) => ({
    files,
    type: UserFilesActionType.SET_FILES
});

export const createDeleteFileAction: ActionCreator<DeleteFileAction> = (id: string) => ({
    id,
    type: UserFilesActionType.DELETE_FILE
});

export const createSetUploadsAction: ActionCreator<SetUploadsAction> = (upload: UploadModel[]) => ({
    uploads: upload,
    type: UserFilesActionType.SET_UPLOADS
});
