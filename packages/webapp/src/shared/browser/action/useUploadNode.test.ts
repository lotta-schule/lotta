import { MockedResponse } from '@apollo/client/testing';
import { currentApolloCache, renderHook, waitFor } from 'test/util';
import { SomeUser, logosDirectory } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { BrowserNode, Upload } from '@lotta-schule/hubert';
import { useUploadNode } from './useUploadNode';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UploadFileMutation from 'api/mutation/UploadFileMutation.graphql';

const parentDirectoryNode = {
  id: logosDirectory.id,
  name: logosDirectory.name,
  type: 'directory',
  meta: { ...logosDirectory, user: SomeUser } as any,
  parent: logosDirectory.parentDirectory?.id ?? null,
} satisfies BrowserNode<'directory'>;

export const additionalMocks: MockedResponse[] = [
  {
    request: {
      query: UploadFileMutation,
    },
    variableMatcher: (variables: any) =>
      variables.file instanceof File &&
      variables.parentDirectoryId === logosDirectory.id,
    result: (variables) => ({
      data: {
        file: {
          id: 'new-id',
          insertedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          filename: variables.file.name,
          filesize: variables.file.size,
          mimeType: variables.file.type,
          fileType: 'MISC',
          userId: SomeUser.id,
          parentDirectory: logosDirectory,
          fileConversions: [],
        },
      },
    }),
  },
];

describe('useUploadNode', () => {
  it('should upload a file', async () => {
    const { result } = renderHook(
      () => useUploadNode(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    const onUpdateNode = vi.fn();

    const upload: Upload = {
      __id: 1,
      file: new File(['This is content.'], 'test-file.txt', {
        type: 'text/plain',
      }),
      error: null,
      status: 'pending',
      progress: 0,
      startTime: new Date().getTime(),
      endTime: undefined,
      parentNode: parentDirectoryNode,
      transferSpeed: 0,
      transferedBytes: 0,
    };

    result.current(upload, parentDirectoryNode, (updater) =>
      onUpdateNode({ ...upload, ...updater(upload) })
    );

    await waitFor(() => {
      expect(onUpdateNode).toHaveBeenCalledWith({
        __id: 1,
        file: new File([''], 'new-name'),
        error: null,
        status: 'done',
        progress: 100,
        startTime: upload.startTime,
        endTime: expect.any(Date),
        parentNode: parentDirectoryNode,
        transferSpeed: 0,
        transferedBytes: 0,
      });
    });

    const cached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: parentDirectoryNode.id },
    });

    const cachedFile = cached!.files.find(
      (directory) => directory.id === 'new-id'
    );

    expect(cachedFile).toBeDefined();
    expect(cachedFile!.id).toEqual('new-id');
    expect(cachedFile!.filename).toEqual('test-file.txt');
  });
});
