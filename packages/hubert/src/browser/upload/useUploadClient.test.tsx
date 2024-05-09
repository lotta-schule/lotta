import { act, renderHook } from '@testing-library/react';
import { useUploadClient } from './useUploadClient';
import { BrowserNode } from '../BrowserStateContext';

describe('useUploadClient', () => {
  const uploadNode = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
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
});
