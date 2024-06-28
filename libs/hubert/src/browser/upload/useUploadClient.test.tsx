import { act, renderHook } from '@testing-library/react';
import { Upload, useUploadClient } from './useUploadClient';
import { BrowserNode } from '../BrowserStateContext';

describe('useUploadClient', () => {
  const uploadNode = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should add a file and start uploading', async () => {
    const { result } = renderHook(() => useUploadClient(uploadNode));

    act(() => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const parentNode: BrowserNode<'directory'> = {
        id: 'test_id',
        name: 'test_directory',
        type: 'directory',
        parent: null,
        meta: {},
      };
      result.current.addFile(file, parentNode);
    });

    expect(uploadNode).toHaveBeenCalled();
    expect(result.current.currentUploads[0].file.name).toBe('test.txt');
    expect(result.current.currentUploads[0].status).toBe('uploading');
  });

  it('should remove uploads that are done for over 5 secs', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      now: 1,
    }); // 15 seconds ago

    const { result, rerender } = renderHook(() => useUploadClient(uploadNode));

    uploadNode.mockImplementation((_upload, _parentNode, update) => {
      setTimeout(
        () =>
          update((upload: Upload) => ({
            status: 'done',
            progress: 100,
            endTime: new Date(upload.startTime + 1),
          })),
        500
      );
    });

    act(() => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const parentNode: BrowserNode<'directory'> = {
        id: 'test_id',
        name: 'test_directory',
        type: 'directory',
        parent: null,
        meta: {},
      };
      result.current.addFile(file, parentNode);
    });

    expect(uploadNode).toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    rerender();

    expect(result.current.currentUploads).toHaveLength(1);
    rerender();

    expect(result.current.currentUploads[0].status).toBe('done');

    vi.advanceTimersByTime(5000);
    rerender();

    expect(result.current.currentUploads).toHaveLength(0);
  });
});
