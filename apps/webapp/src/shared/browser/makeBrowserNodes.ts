import { BrowserNode, BrowserPath } from '@lotta-schule/hubert';
import { ResultOf } from 'gql.tada';
import {
  BrowserDirectoryFragment,
  BrowserFileFragment,
} from './_graphql/GetDirectoriesAndFiles';

// With @_unmask on both fragments, FragmentOf<> == ResultOf<> (no masking).
export type BrowserDirectoryData = ResultOf<typeof BrowserDirectoryFragment>;
export type BrowserFileData = ResultOf<typeof BrowserFileFragment>;

const makeDirectoryNode = (
  directory: BrowserDirectoryData
): BrowserNode<'directory'> => ({
  id: directory.id,
  name: directory.name,
  type: 'directory',
  parent: directory.parentDirectory?.id ?? null,
  meta: directory,
});

const makeFileNode = (file: BrowserFileData): BrowserNode<'file'> => ({
  id: file.id,
  name: file.filename ?? '',
  type: 'file',
  parent: file.parentDirectory?.id ?? null,
  meta: {
    ...file,
    mimeType: file.mimeType ?? '',
    size: file.filesize ?? 0,
    metadata: {},
  },
});

export const makeBrowserNodes = (
  result?: {
    files?: BrowserFileData[] | null;
    directories?: BrowserDirectoryData[] | null;
  } | null
) => {
  if (!result) {
    return null;
  }

  const directoryNodes = (result.directories ?? []).map(makeDirectoryNode);
  const fileNodes = (result.files ?? []).map(makeFileNode);

  return [...directoryNodes, ...fileNodes] as BrowserNode[];
};

export const makeDirectoryPaths = (
  result?: {
    files?: (BrowserFileData & { path: BrowserDirectoryData[] })[] | null;
    directories?:
      | (BrowserDirectoryData & { path: BrowserDirectoryData[] })[]
      | null;
  } | null
) => {
  if (!result) {
    return null;
  }

  const directoryPaths = (result.directories ?? []).map(
    ({ path, ...directory }) =>
      [...path, directory].map(makeDirectoryNode) as BrowserPath
  );
  const filePaths = (result.files ?? []).map(
    ({ path, ...file }) =>
      [...path.map(makeDirectoryNode), makeFileNode(file)] as BrowserPath
  );

  return Array.prototype.concat([], directoryPaths, filePaths);
};
