import { ID } from './ID';
import { UserModel } from './UserModel';

export interface DirectoryModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    name: string;
    user?: Partial<UserModel>;
    parentDirectory?: Partial<DirectoryModel>
}

export enum FileModelType {
    Pdf = 'PDF',
    Image = 'IMAGE',
    Video = 'VIDEO',
    Audio = 'AUDIO',
    Misc = 'MISC',
    Directory = 'DIRECTORY',
}

export interface FileModel {
    id: ID;
    userId: ID;
    insertedAt: string;
    updatedAt: string;
    filename: string;
    filesize: number;
    remoteLocation: string;
    mimeType: string;
    fileType: FileModelType;
    parentDirectory?: Partial<DirectoryModel>
    fileConversions: FileConversion[];
}

export interface FileConversion {
    fileType: FileModelType;
    format: string;
    mimeType: string;
    remoteLocation: string;
}