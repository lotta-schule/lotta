import { ID } from './ID';

export interface UploadModel {
    id: ID;
    path: string;
    isPublic: boolean;
    filename: string;
    uploadProgress: number;
}
