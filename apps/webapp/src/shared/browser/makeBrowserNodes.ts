import { BrowserNode, BrowserPath } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from '#/model/index.js';

export type GetDirectoriesAndFilesQueryResult = {
  directories: DirectoryModel[];
  files: FileModel[];
};

const makeDirectoryNode = (
  directory: DirectoryModel
): BrowserNode<'directory'> => ({
  id: directory.id,
  name: directory.name,
  type: 'directory',
  parent: directory.parentDirectory?.id ?? null,
  meta: directory,
});

const makeFileNode = (file: FileModel): BrowserNode<'file'> => ({
  id: file.id,
  name: file.filename ?? '',
  type: 'file',
  parent: file.parentDirectory?.id ?? null,
  // hubert's BrowserNode<'file'> meta is DefaultFileMetadata (mimeType/size/metadata).
  // Map the FileModel onto it while keeping the full file accessible (downstream code
  // reads `node.meta as FileModel`). Making BrowserNode generic over its meta type is a
  // hubert-side change tracked under the lib bucket.
  meta: {
    ...file,
    mimeType: file.mimeType ?? '',
    size: file.filesize ?? 0,
    metadata: {},
  },
});

export const makeBrowserNodes = (result?: {
  files: FileModel[];
  directories: DirectoryModel[];
}) => {
  if (!result) {
    return null;
  }

  const directoryNodes = result.directories.map(makeDirectoryNode);

  const fileNodes = result.files.map(makeFileNode);

  return [...directoryNodes, ...fileNodes] as BrowserNode[];
};

export const makeDirectoryPaths = (result?: {
  files: (FileModel & { path: DirectoryModel[] })[];
  directories: (DirectoryModel & { path: DirectoryModel[] })[];
}) => {
  if (!result) {
    return null;
  }

  const directoryPaths = result.directories.map(
    ({ path, ...directory }) =>
      [...path, directory].map(makeDirectoryNode) as BrowserPath
  );
  const filePaths = result.files.map(
    ({ path, ...directory }) =>
      [...path.map(makeDirectoryNode), makeFileNode(directory)] as BrowserPath
  );

  return Array.prototype.concat([], directoryPaths, filePaths);
};
