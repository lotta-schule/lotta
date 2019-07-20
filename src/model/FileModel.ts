export enum FileModelType {
    Image = 'IMAGE',
    Video = 'VIDEO',
    Audio = 'AUDIO',
    Misc = 'MISC',
    Directory = 'DIRECTORY',
}

export interface FileModel {
    id: string;
    insertedAt: string;
    updatedAt: string;
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