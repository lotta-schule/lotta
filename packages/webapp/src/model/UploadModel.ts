import { ID } from './ID';
import { DirectoryModel } from './FileModel';

export interface UploadModel {
    id: ID;
    parentDirectory: DirectoryModel;
    filename: string;
    uploadProgress: number;
    error: Error | null;
}
