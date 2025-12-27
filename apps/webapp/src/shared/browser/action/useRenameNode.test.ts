import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook } from 'test/util';
import { SomeUser, imageFile, logosDirectory } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { BrowserNode } from '../../../../../../libs/hubert/src/browser';
import { useRenameNode } from './useRenameNode';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

const directory = {
  ...logosDirectory,
  user: SomeUser,
  insertedAt: new Date().toISOString(),
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
  parent: null,
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
      variables: { parentDirectoryId: directory.id },
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
      query: UpdateDirectoryMutation,
      variables: {
        id: directory.id,
        name: 'renamed-directory',
      },
    },
    result: {
      data: {
        directory: { ...directory, name: 'renamed-directory' },
      },
    },
  },
  {
    request: {
      query: UpdateFileMutation,
      variables: {
        id: file.id,
        filename: 'renamed-file',
      },
    },
    result: {
      data: {
        file: { ...file, filename: 'renamed-file' },
      },
    },
  },
];

describe('useRenameNode', () => {
  it('should rename a directory', async () => {
    const { result } = renderHook(
      () => useRenameNode(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
      data: {
        directories: [directory],
        files: [],
      },
    });

    await result.current(directoryNode, 'renamed-directory');

    const fromCache = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
    });

    expect(fromCache!.directories[0].name).toEqual('renamed-directory');
  });

  it('should rename a file', async () => {
    const { result } = renderHook(
      () => useRenameNode(),
      {},
      { additionalMocks, currentUser: SomeUser }
    );

    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directory.id },
      data: {
        directories: [],
        files: [file],
      },
    });

    await result.current(fileNode, 'renamed-file');

    const fromCache = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directory.id },
    });

    expect(fromCache!.files[0].filename).toEqual('renamed-file');
  });
});
