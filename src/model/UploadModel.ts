import { ID } from './ID';

export interface UploadModel {
    id: ID;
    path: string;
    filename: string;
    uploadProgress: number;
}
