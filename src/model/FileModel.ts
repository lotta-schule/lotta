export enum FileModelType {
    Image = 'Image',
    Video = 'Video',
    Audio = 'Audio',
    Misc = 'Misc'
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
}
