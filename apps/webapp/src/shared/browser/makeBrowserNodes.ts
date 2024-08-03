import { BrowserNode, BrowserPath } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

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
  name: file.filename,
  type: 'file',
  parent: file.parentDirectory?.id ?? null,
  meta: file,
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
