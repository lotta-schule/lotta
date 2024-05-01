import * as React from 'react';
import { BrowserNode } from '../BrowserStateContext';

export type Upload = {
  file: File;
  parentNode: BrowserNode<'directory'>;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error: Error | null;
  startTime: number;
  endTime?: Date;
  progress: number;
  transferSpeed: number;
  transferedBytes: number;
};

export const useUploadClient = () => {
  const [currentUploads, setCurrentUploads] = React.useState<Upload[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUploads((currentUploads) => {
        const uploads = currentUploads
          .map((upload) => {
            if (upload.status === 'pending') {
              if (Math.random() > 0.8) {
                return {
                  ...upload,
                  status: 'uploading',
                } as Upload;
              } else {
                return upload;
              }
            }

            if (upload.status === 'uploading') {
              const hasErrored = Math.random() > 0.98;

              if (hasErrored) {
                return {
                  ...upload,
                  status: 'error',
                  error: new Error('Upload failed'),
                  endTime: new Date(),
                } as Upload;
              }

              const currentTime = Date.now();
              const elapsedTime = currentTime - upload.startTime;
              const transferedBytes = upload.progress * upload.file.size;
              const transferSpeed = transferedBytes / elapsedTime;
              const progress = Math.floor(
                Math.min(upload.progress + Math.random() * 10, 100)
              );

              if (progress >= 100) {
                return {
                  ...upload,
                  transferSpeed,
                  status: 'done',
                  endTime: new Date(),
                } as Upload;
              }

              return {
                ...upload,
                transferSpeed,
                progress,
              };
            }

            if (upload.status === 'done') {
              if (
                !upload.endTime ||
                upload.endTime.getTime() < Date.now() + 60 * 1000
              ) {
                null;
              }
            }

            return {
              ...upload,
            };
          })
          .filter(Boolean);

        return uploads;
      });
    }, 750);

    return () => clearInterval(interval);
  }, []);

  const addFile = React.useCallback(
    async (file: File, parentNode: BrowserNode<'directory'>) => {
      const upload = createUpload(file, parentNode);
      setCurrentUploads((currentUploads) => [...currentUploads, upload]);
    },
    [setCurrentUploads]
  );

  const currentProgress = React.useMemo(() => {
    if (!currentUploads.length) {
      return null;
    }
    const doneUploads = currentUploads.filter(
      ({ status }) => status === 'done'
    );

    const processingUploads = currentUploads.filter(({ status }) =>
      ['pending', 'uploading'].includes(status)
    );

    if (processingUploads.length === 0) {
      if (doneUploads.length) {
        return 100;
      }
      return null;
    }

    return (
      processingUploads.reduce((acc, upload) => acc + upload.progress, 0) /
      processingUploads.length
    );
  }, [currentUploads]);

  const hasErrors = React.useMemo(
    () => currentUploads.some(({ status }) => status === 'error'),
    [currentUploads]
  );

  const isUploading = React.useMemo(
    () => currentUploads.some(({ status }) => status === 'uploading'),
    [currentUploads]
  );

  const isSuccess = React.useMemo(
    () => currentUploads.every(({ status }) => status === 'done'),
    [currentUploads]
  );

  return React.useMemo(
    () => ({
      currentUploads,
      addFile,
      currentProgress,
      hasErrors,
      isUploading,
      isSuccess,
    }),
    [
      currentUploads,
      addFile,
      currentProgress,
      hasErrors,
      isUploading,
      isSuccess,
    ]
  );
};

export const createUpload = (
  file: File,
  parentNode: BrowserNode<'directory'>
) => {
  return {
    file,
    parentNode,
    status: 'pending',
    error: null,
    startTime: Date.now(),
    progress: 0,
    transferSpeed: 0,
    transferedBytes: 0,
  } as Upload;
};
