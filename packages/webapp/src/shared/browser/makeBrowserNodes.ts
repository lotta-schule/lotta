import { BrowserNode } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

export type GetDirectoriesAndFilesQueryResult = {
  directories: DirectoryModel[];
  files: FileModel[];
};

export const makeBrowserNodes = (
  result?: GetDirectoriesAndFilesQueryResult
): BrowserNode[] | null => {
  if (!result) {
    return null;
  }

  const directoryNodes = result.directories.map(
    (directory) =>
      ({
        id: directory.id,
        name: directory.name,
        type: 'directory',
        parent: directory.parentDirectory?.id ?? null,
        meta: directory,
      }) as const
  );

  const fileNodes = result.files.map(
    (file) =>
      ({
        id: file.id,
        name: file.filename,
        type: 'file',
        parent: file.parentDirectory?.id ?? null,
        meta: file,
      }) as const
  );

  return [...directoryNodes, ...fileNodes];
};
