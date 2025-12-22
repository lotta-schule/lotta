import { MockLink } from '@apollo/client/testing';
import { currentApolloCache, renderHook } from 'test/util';
import {
  SomeUser,
  imageFile,
  logosDirectory,
  profilDirectory,
} from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { BrowserNode } from '@lotta-schule/hubert';
import { useMoveNode } from './useMoveNode';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

const targetDirectory = {
  ...profilDirectory,
  user: SomeUser,
} as DirectoryModel;
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

const targetDirectoryNode = {
  id: targetDirectory.id,
  name: targetDirectory.name,
  type: 'directory',
  meta: targetDirectory,
  parent: null,
} as BrowserNode<'directory'>;
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
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: targetDirectory.id },
    },
    result: {
      data: {
        directories: [],
        files: [],
      },
    },
  },
  {
    request: {
      query: UpdateDirectoryMutation,
      variables: {
        id: directory.id,
        parentDirectoryId: targetDirectory.id,
      },
    },
    result: {
      data: {
        directory: { ...directory, parentDirectory: targetDirectory },
      },
    },
  },
  {
    request: {
      query: UpdateFileMutation,
      variables: {
        id: file.id,
        parentDirectoryId: targetDirectory.id,
      },
    },
    result: {
      data: {
        file: { ...file, parentDirectory: targetDirectory },
      },
    },
  },
];

describe('useMoveNode', () => {
  it('should move a directory', async () => {
    const { result } = renderHook(
      () => useMoveNode(),
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
    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: targetDirectory.id },
      data: {
        directories: [],
        files: [],
      },
    });

    await result.current(directoryNode, targetDirectoryNode);

    const fromCache = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: null },
    });

    const cachedFromDirectory = fromCache!.directories.find(
      (d) => d.id === directory.id
    );

    expect(cachedFromDirectory).toBeUndefined();

    const targetCached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: targetDirectory.id },
    });

    const cacheTargetDirectory = targetCached!.directories.find(
      (d) => d.id === directory.id
    );

    expect(cacheTargetDirectory).toBeDefined();
    expect(cacheTargetDirectory!.name).toEqual(directory.name);
  });

  it('should move a file', async () => {
    const { result } = renderHook(
      () => useMoveNode(),
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
    currentApolloCache!.writeQuery({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: targetDirectory.id },
      data: {
        directories: [],
        files: [],
      },
    });

    await result.current(fileNode, targetDirectoryNode);

    const fromCache = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: directory.id },
    });

    const cachedFromFile = fromCache!.files.find((f) => f.id === file.id);

    expect(cachedFromFile).toBeUndefined();

    const targetCached = currentApolloCache!.readQuery<{
      directories: DirectoryModel[];
      files: FileModel[];
    }>({
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: targetDirectory.id },
    });

    const cacheTargetFile = targetCached!.files.find((f) => f.id === file.id);

    expect(cacheTargetFile).toBeDefined();
    expect(cacheTargetFile!.filename).toEqual(file.filename);
  });
});
