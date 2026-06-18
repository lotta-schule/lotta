import { BrowserNode } from './BrowserStateContext';

export const isFileNode = (
  node: BrowserNode | null | undefined
): node is BrowserNode<'file'> => Boolean(node && node.type === 'file');

export const isDirectoryNode = (
  node: BrowserNode | null | undefined
): node is BrowserNode<'directory'> =>
  Boolean(node && node.type === 'directory');
