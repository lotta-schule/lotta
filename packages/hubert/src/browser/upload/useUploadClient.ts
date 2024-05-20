import * as React from 'react';
import { BrowserNode, BrowserState } from '../BrowserStateContext';

export type Upload = {
  __id: number;
  file: File;
  parentNode: BrowserNode<'directory'>;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error: Error | null;
  startTime: number;
  endTime?: number;
  progress: number;
  transferSpeed: number;
  transferedBytes: number;
};

export const useUploadClient = (uploadNode: BrowserState['uploadNode']) => {
  const nextUploadId = React.useRef(0);
  const [currentUploads, setCurrentUploads] = React.useState<Upload[]>([]);

  const pendingUploads = React.useMemo(
    () => currentUploads.filter(({ status }) => status === 'pending'),
    [currentUploads]
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setCurrentUploads((currentUploads) => {
        const doneSinceMoreThan5Seconds = currentUploads.filter(
          (cu) => cu.status === 'done' && cu.endTime && now - cu.endTime > 5000
        );

        if (!doneSinceMoreThan5Seconds.length) {
          return currentUploads;
        }

        return currentUploads.filter(
          (cu) =>
            cu.status !== 'done' ||
            (cu.endTime &&
              now - cu.endTime <= 5000 &&
              !doneSinceMoreThan5Seconds.includes(cu))
        );
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createUpload = React.useCallback(
    (file: File, parentNode: BrowserNode<'directory'>) => {
      return {
        __id: nextUploadId.current++,
        file,
        parentNode,
        status: 'pending',
        error: null,
        startTime: new Date().getTime(),
        progress: 0,
        transferSpeed: 0,
        transferedBytes: 0,
      } as Upload;
    },
    []
  );

  const updateUpload = React.useCallback(
    (id: Upload['__id'], updater: (current: Upload) => Partial<Upload>) => {
      setCurrentUploads((currentUploads) =>
        currentUploads.map((u) =>
          u.__id === id ? Object.assign({}, u, updater(u)) : u
        )
      );
    },
    []
  );

  React.useEffect(() => {
    if (pendingUploads.length < 1) {
      return;
    }

    const nextUpload = pendingUploads.at(0)!;

    updateUpload(nextUpload.__id, () => ({ status: 'uploading' }));

    uploadNode?.(nextUpload, nextUpload.parentNode, (updateFn) =>
      updateUpload(nextUpload.__id, updateFn)
    );
  }, [pendingUploads, uploadNode, updateUpload]);

  const addFile = React.useCallback(
    async (file: File, parentNode: BrowserNode<'directory'>) => {
      const newUpload = createUpload(file, parentNode);
      setCurrentUploads((currentUploads) => [...currentUploads, newUpload]);
    },
    [setCurrentUploads, createUpload]
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

  const byState = React.useMemo(
    () =>
      Object.fromEntries(
        (['pending', 'uploading', 'done', 'error'] as const).map((state) => [
          state,
          currentUploads.filter(({ status }) => status === state),
        ])
      ) as Record<Upload['status'], Upload[]>,
    [currentUploads]
  );

  return React.useMemo(
    () => ({
      currentUploads,
      byState,
      addFile,
      currentProgress,
      hasErrors,
      isUploading,
      isSuccess,
    }),
    [
      currentUploads,
      byState,
      addFile,
      currentProgress,
      hasErrors,
      isUploading,
      isSuccess,
    ]
  );
};
