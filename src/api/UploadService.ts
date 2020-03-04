import { client } from './client';
import { UploadModel, FileModel } from '../model';
import { UploadFileMutation } from './mutation/UploadFileMutation';

export class UploadService implements UploadModel {
    public id = new Date().getTime() + Math.random() * 1000;

    public path: string;

    public uploadProgress: number;

    public isPublic: boolean;

    public error: Error | null;

    protected file: File;

    public get filename(): string {
        return this.file.name;
    }

    public constructor(file: File, path: string, isPublic: boolean) {
        this.file = file;
        this.path = path;
        this.isPublic = isPublic;
        this.uploadProgress = 0;
        this.error = null;
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
                isPublic: this.isPublic,
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
            .catch(error => {
                this.error = error;
                onError(error);
            });
        return this;
    }
}
