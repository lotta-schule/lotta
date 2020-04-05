import { client } from './client';
import { UploadModel, FileModel, DirectoryModel } from '../model';
import { UploadFileMutation } from './mutation/UploadFileMutation';
import { GetDirectoriesAndFilesQuery } from './query/GetDirectoriesAndFiles';

export class UploadService implements UploadModel {
    public id = new Date().getTime() + Math.random() * 1000;

    public parentDirectory: DirectoryModel;

    public uploadProgress: number;

    public error: Error | null;

    protected file: File;

    public get filename(): string {
        return this.file.name;
    }

    public constructor(file: File, parentDirectory: DirectoryModel) {
        this.file = file;
        this.parentDirectory = parentDirectory;
        this.uploadProgress = 0;
        this.error = null;
    }

    public startUploading(
        onProgress: (event: number) => void,
        onFinish: (file: FileModel) => void,
        onError: (error: Error) => void
    ): UploadService {
        client
            .mutate<{ file: FileModel }>({
                mutation: UploadFileMutation,
                variables: {
                    parentDirectoryId: this.parentDirectory.id,
                    file: this.file
                },
                update: (client, { data }) => {
                    const cache = client.readQuery<{ files: FileModel[], directories: DirectoryModel[] }>({
                        query: GetDirectoriesAndFilesQuery,
                        variables: { parentDirectoryId: data?.file.parentDirectory?.id }
                    });
                    client.writeQuery({
                        query: GetDirectoriesAndFilesQuery,
                        variables: { parentDirectoryId: data?.file.parentDirectory?.id },
                        data: {
                            files: [...(cache?.files ?? []), data?.file],
                            directories: [...(cache?.directories ?? [])]
                        }
                    })
                },
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
