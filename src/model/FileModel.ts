export enum FileModelType {
    Image = 'Image',
    Video = 'Video',
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
    type: FileModelType;
}
