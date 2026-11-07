import { MockLink } from '@apollo/client/testing';
import { useQuery } from '@apollo/client/react';
import { currentApolloCache, renderHook, waitFor } from '#/test/util';
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

  it('shows the new directory when a listing requested before creating it arrives after', async () => {
    const newDirectory = additionalMocks[0].result.data.directory;
    const listing = (directories: unknown[], delay = 0) => ({
      request: {
        query: GetDirectoriesAndFilesQuery,
        variables: { parentDirectoryId: parentDirectoryNode.id },
      },
      delay,
      result: { data: { directories, files: [] } },
    });

    const { result } = renderHook(
      () => ({
        listing: useQuery(GetDirectoriesAndFilesQuery, {
          variables: { parentDirectoryId: parentDirectoryNode.id },
        }),
        createDirectory: useCreateDirectory(),
      }),
      {},
      {
        additionalMocks: [
          // requested before the directory is created, answered after
          listing([], 300),
          ...additionalMocks,
          listing([newDirectory]),
        ],
        currentUser: SomeUser,
      }
    );

    await result.current.createDirectory(parentDirectoryNode, 'new-name');

    // until the listing requested before is answered as well
    await new Promise((resolve) => setTimeout(resolve, 500));
    await waitFor(() => {
      expect(result.current.listing.data?.directories.map((d) => d.id)).toEqual(
        ['new-id']
      );
    });
  });
});
