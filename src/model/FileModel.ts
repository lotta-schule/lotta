import { ID } from './ID';

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
    insertedAt: string;
    updatedAt: string;
    isPublic: boolean;
    path: string;
    filename: string;
    filesize: number;
    remoteLocation: string;
    mimeType: string;
    fileType: FileModelType;
    fileConversions: FileConversion[];
}

export interface FileConversion {
    fileType: FileModelType;
    format: string;
    mimeType: string;
    remoteLocation: string;
}