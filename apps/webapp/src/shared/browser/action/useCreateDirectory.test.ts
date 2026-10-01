import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook } from '#/test/util';
import { SomeUser, logosDirectory } from '#/test/fixtures';
import { BrowserNode } from '../../../../../../libs/hubert/src/browser';
import { useCreateDirectory } from './useCreateDirectory';

import CreateDirectoryMutation from '#/api/mutation/CreateDirectoryMutation.graphql';
import { GetDirectoriesAndFilesQuery } from '../_graphql/GetDirectoriesAndFiles';

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
          __typename: 'Directory',
          id: 'new-id',
          name: 'new-name',
          insertedAt: new Date().toISOString(),
          user: { __typename: 'User', id: SomeUser.id },
          parentDirectory: {
            __typename: 'Directory',
            id: parentDirectoryNode.id,
          },
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

    const cached = currentApolloCache!.readQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: parentDirectoryNode.id },
    });

    const cachedDirectory = cached?.directories.find(
      (directory) => directory.id === 'new-id'
    );

    expect(cachedDirectory?.id).toEqual('new-id');
    expect(cachedDirectory?.name).toEqual('new-name');
  });
});
