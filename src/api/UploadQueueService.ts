import { UploadService } from './UploadService';
import { UploadModel, FileModel } from 'model';
import { Waiter } from 'util/Waiter';

export class UploadQueueService {
    protected uploads: UploadService[] = [];

    protected updateAction: (updates: UploadModel[]) => void;

    protected addFileAction: (file: FileModel) => void;

    public constructor(updateAction: (updates: UploadModel[]) => void, addFileAction: (file: FileModel) => void) {
        this.updateAction = updateAction;
        this.addFileAction = addFileAction;
    }

    public uploadFile(file: File, path: string): void {
        const upload = new UploadService(file, path);
        this.uploads.push(upload);
        upload.startUploading(
            this.update.bind(this),
            async uploadFile => {
                this.update();
                await Waiter.wait(250);
                if (this.uploads.filter(u => u.uploadProgress < 100).length === 0) {
                    this.uploads = [];
                    this.update();
                }
                this.addFileAction(uploadFile);
            },
            this.update.bind(this)
        );
    }

    protected removeUpload(upload: UploadService): UploadQueueService {
        this.uploads = this.uploads.filter(u => u !== upload);
        this.update();
        return this;
    }

    protected update(): void {
        this.updateAction(
            this.uploads.map(upload => ({
                id: upload.id,
                path: upload.path,
                filename: upload.filename,
                uploadProgress: upload.uploadProgress
            }))
        );
    }
}
