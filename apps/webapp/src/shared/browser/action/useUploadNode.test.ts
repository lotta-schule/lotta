import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook, waitFor } from '#/test/util';
import { SomeUser, logosDirectory } from '#/test/fixtures';
import { BrowserNode, Upload } from '@lotta-schule/hubert';
import { useUploadNode, UPLOAD_FILE_MUTATION } from './useUploadNode';
import { GetDirectoriesAndFilesQuery } from '../_graphql/GetDirectoriesAndFiles';

const parentDirectoryNode = {
  id: logosDirectory.id,
  name: logosDirectory.name,
  type: 'directory',
  meta: { ...logosDirectory, user: SomeUser } as any,
  parent: logosDirectory.parentDirectory?.id ?? null,
} satisfies BrowserNode<'directory'>;

export const additionalMocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: UPLOAD_FILE_MUTATION,
      variables: (vars) =>
        vars.file instanceof File &&
        vars.parentDirectoryId === logosDirectory.id,
    },
    result: (variables) => ({
      data: {
        file: {
          __typename: 'File',
          id: 'new-id',
          insertedAt: new Date().toISOString(),
          filename: variables.file.name,
          filesize: variables.file.size,
          mimeType: variables.file.type,
          fileType: 'MISC',
          userId: SomeUser.id,
          parentDirectory: { __typename: 'Directory', id: logosDirectory.id },
          metadata: {},
          formats: [],
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
        endTime: expect.any(Number),
        parentNode: parentDirectoryNode,
        transferSpeed: 0,
        transferedBytes: 0,
      });
    });

    const cached = currentApolloCache!.readQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: parentDirectoryNode.id },
    });

    const cachedFile = cached?.files.find(
      (directory) => directory.id === 'new-id'
    );

    expect(cachedFile).toBeDefined();
    expect(cachedFile!.id).toEqual('new-id');
    expect(cachedFile!.filename).toEqual('test-file.txt');
  });
});
