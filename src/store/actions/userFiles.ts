import { ActionCreator, Action } from 'redux';
import { FileModel, UploadModel } from '../../model';

// Action Types

export enum UserFilesActionType {
    SET_FILES = '[UserFilesAction] set Files',
    ADD_FILE = '[UserFilesAction] add File',
    DELETE_FILE = '[UserFilesAction] delete File',
    ADD_UPLOAD = '[UserFilesAction] add Upload',
    UPDATE_UPLOAD = '[UserFilesAction] update Upload',
    DELETE_UPLOAD = '[UserFilesAction] delete Upload',
}


// Actions

export type AddFileAction = Action<UserFilesActionType.ADD_FILE> & { file: FileModel };

export type SetFilesAction = Action<UserFilesActionType.SET_FILES> & { files: FileModel[] };

export type DeleteFileAction = Action<UserFilesActionType.DELETE_FILE> & { id: string };

export type AddUploadAction = Action<UserFilesActionType.ADD_UPLOAD> & { upload: UploadModel };
export type UpdateUploadAction = Action<UserFilesActionType.UPDATE_UPLOAD> & { upload: UploadModel };
export type DeleteUploadAction = Action<UserFilesActionType.DELETE_UPLOAD> & { id: string };

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

export const createAddUploadAction: ActionCreator<AddUploadAction> = (upload: UploadModel) => ({
    upload,
    type: UserFilesActionType.ADD_UPLOAD
});

export const createUpdateUploadAction: ActionCreator<UpdateUploadAction> = (upload: UploadModel) => ({
    upload,
    type: UserFilesActionType.UPDATE_UPLOAD
});

export const createDeleteUploadAction: ActionCreator<DeleteUploadAction> = (id: string) => ({
    id,
    type: UserFilesActionType.DELETE_UPLOAD
});
