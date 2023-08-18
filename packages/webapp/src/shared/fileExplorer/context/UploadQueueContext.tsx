import * as React from 'react';
import { DirectoryModel, UploadModel } from 'model';
import { Waiter } from 'util/Waiter';
import { Upload } from './Upload';

export class UploadQueue {
  public uploads: Upload[] = [];

  protected onSetUpdates: (updates: UploadModel[]) => void;

  public constructor(onSetUpdates: (updates: UploadModel[]) => void) {
    this.onSetUpdates = onSetUpdates;
  }

  public uploadFile(file: File, parentDirectory: DirectoryModel): void {
    const upload = new Upload(file, parentDirectory);
    this.uploads.push(upload);
    upload.startUploading(
      this.setUploads.bind(this),
      async () => {
        this.setUploads();
        await Waiter.wait(250);
        if (this.uploads.filter((u) => u.uploadProgress < 100).length === 0) {
          this.uploads = [];
          this.setUploads();
        }
      },
      this.setUploads.bind(this)
    );
  }

  protected setUploads() {
    this.onSetUpdates(
      this.uploads.map((upload) => ({
        id: upload.id,
        parentDirectory: upload.parentDirectory,
        filename: upload.filename,
        uploadProgress: upload.uploadProgress,
        error: upload.error,
      }))
    );
  }
}

export const UploadQueueContext = React.createContext<
  [UploadModel[], (f: File, pd: DirectoryModel) => void]
>([[], () => {}]);

export type UploadQueueProviderProps = {
  children: React.ReactNode;
};

export const UploadQueueProvider = ({ children }: UploadQueueProviderProps) => {
  const [uploads, setUploads] = React.useState([] as UploadModel[]);
  const uploadQueue = React.useRef(new UploadQueue(setUploads));

  return (
    <UploadQueueContext.Provider
      value={[
        uploads,
        uploadQueue.current.uploadFile.bind(uploadQueue.current),
      ]}
    >
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploads = () => {
  const [uploads] = React.useContext(UploadQueueContext);
  return uploads;
};

export const useCreateUpload = () => {
  const [, dispatch] = React.useContext(UploadQueueContext);
  return dispatch;
};
