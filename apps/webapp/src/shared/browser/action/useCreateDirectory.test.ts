import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook } from 'test/util';
import { SomeUser, logosDirectory } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { BrowserNode } from '../../../../../../libs/hubert/src/browser';
import { useCreateDirectory } from './useCreateDirectory';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import CreateDirectoryMutation from 'api/mutation/CreateDirectoryMutation.graphql';

const parentDirectoryNode = {
  id: logosDirectory.id,
  name: logosDirectory.name,
  type: 'directory',
  meta: { ...logosDirectory, user: SomeUser } as any,
  parent: logosDirectory.parentDirectory?.id ?? null,
} satisfies BrowserNode<'directory'>;

const additionalMocks = [
  {
    request: {
      query: CreateDirectoryMutation,
      variables: {
        name: 'new-name',
        parentDirectoryId: parentDirectoryNode.id,
        isPublic: false,
      },
    },
    result: {
      data: {
        directory: {
          id: 'new-id',
          name: 'new-name',
          insertedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: SomeUser,
          parentDirectory: parentDirectoryNode,
        },
      },
    },
  },
] satisfies MockLink.MockedResponse[];

describe('useCreateDirectory', () => {
  it('should create a new directory', async () => {
    const { result } = renderHook(
      () => useCreateDirectory(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    await result.current(parentDirectoryNode, 'new-name');

    const cached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: parentDirectoryNode.id },
    });

    const cachedDirectory = cached!.directories.find(
      (directory) => directory.id === 'new-id'
    );

    expect(cachedDirectory?.id).toEqual('new-id');
    expect(cachedDirectory?.name).toEqual('new-name');
  });
});
