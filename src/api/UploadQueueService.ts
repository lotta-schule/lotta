import { UploadService } from './UploadService';
import { UploadModel, DirectoryModel } from 'model';
import { Waiter } from 'util/Waiter';

export class UploadQueueService {
    protected uploads: UploadService[] = [];

    protected updateAction: (updates: UploadModel[]) => void;

    public constructor(updateAction: (updates: UploadModel[]) => void) {
        this.updateAction = updateAction;
    }

    public uploadFile(file: File, parentDirectory: DirectoryModel): void {
        const upload = new UploadService(file, parentDirectory);
        this.uploads.push(upload);
        upload.startUploading(
            this.update.bind(this),
            async () => {
                this.update();
                await Waiter.wait(250);
                if (this.uploads.filter(u => u.uploadProgress < 100).length === 0) {
                    this.uploads = [];
                    this.update();
                }
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
                parentDirectory: upload.parentDirectory,
                filename: upload.filename,
                uploadProgress: upload.uploadProgress,
                error: upload.error
            }))
        );
    }
}
