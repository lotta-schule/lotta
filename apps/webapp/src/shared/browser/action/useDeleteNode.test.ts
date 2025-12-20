import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook } from 'test/util';
import { SomeUser, imageFile, logosDirectory } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { BrowserNode } from '../../../../../../libs/hubert/src/browser';
import { useDeleteNode } from './useDeleteNode';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import DeleteDirectoryMutation from 'api/mutation/DeleteDirectoryMutation.graphql';
import DeleteFileMutation from 'api/mutation/DeleteFileMutation.graphql';

const directory = {
  ...logosDirectory,
  user: SomeUser,
} as DirectoryModel;
const file = {
  ...imageFile,
  user: SomeUser,
  userId: SomeUser.id,
  parentDirectory: directory,
} as FileModel;

const directoryNode = {
  id: logosDirectory.id,
  name: logosDirectory.name,
  type: 'directory',
  meta: directory,
  parent: logosDirectory.parentDirectory?.id ?? null,
} as BrowserNode<'directory'>;

const fileNode = {
  id: imageFile.id,
  type: 'file',
  name: imageFile.filename,
  parent: directoryNode.id,
  meta: file,
} as BrowserNode<'file'>;

export const additionalMocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
    },
    result: {
      data: {
        directories: [directory],
        files: [],
      },
    },
  },
  {
    request: {
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directoryNode.id },
    },
    result: {
      data: {
        directories: [],
        files: [file],
      },
    },
  },
  {
    request: {
      query: DeleteDirectoryMutation,
      variables: {
        id: directoryNode.id,
      },
    },
    result: {
      data: {
        directory: directory,
      },
    },
  },
  {
    request: {
      query: DeleteFileMutation,
      variables: {
        id: fileNode.id,
      },
    },
    result: {
      data: {
        file: file,
      },
    },
  },
];

describe('useDeleteNode', () => {
  it('should delete a directory', async () => {
    const { result } = renderHook(
      () => useDeleteNode(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
      data: {
        directories: [directoryNode.meta],
        files: [],
      },
    });

    await result.current(directoryNode);

    const cached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
    });

    const cachedDirectory = cached!.directories.find(
      (d) => d.id === directory.id
    );

    expect(cachedDirectory).toBeUndefined();
  });

  it('should delete a file', async () => {
    const { result } = renderHook(
      () => useDeleteNode(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directoryNode.id },
      data: {
        directories: [],
        files: [file],
      },
    });

    await result.current(fileNode);

    const cached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directory.id },
    });

    const cachedFile = cached!.files.find((f) => f.id === f.id);

    expect(cachedFile).toBeUndefined();
  });
});
