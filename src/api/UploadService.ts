import uuid from 'uuid/v1';
import { client } from './client';
import { UploadModel, FileModel } from '../model';
import { UploadFileMutation } from './mutation/UploadFile';

export class UploadService implements UploadModel {
    public path: string;

    public uploadProgress: number;

    public id = uuid();

    protected file: File;

    public get filename(): string {
        return this.file.name;
    }

    public constructor(file: File, path: string) {
        this.file = file;
        this.path = path;
        this.uploadProgress = 0;
    }

    public startUploading(
        onProgress: (event: number) => void,
        onFinish: (file: FileModel) => void,
        onError: (error: Error) => void
    ): UploadService {
        client.mutate<{ file: FileModel }>({
            mutation: UploadFileMutation,
            variables: {
                path: this.path,
                file: this.file
            },
            errorPolicy: 'all',
            context: {
                fetchOptions: {
                    onUploadProgress: (progress: ProgressEvent) => {
                        this.uploadProgress = (progress.loaded / progress.total) * 100;
                        onProgress(this.uploadProgress);
                    }
                }
            }
        })
            .then(({ data }) => {
                this.uploadProgress = 100;
                if (!data) {
                    throw new Error('No Data Received');
                }
                return onFinish(data.file);
            })
            .catch(onError);
        return this;
    }
}
