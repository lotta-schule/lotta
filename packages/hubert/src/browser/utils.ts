import { BrowserNode } from './BrowserStateContext';

export const isFileNode = (node: BrowserNode): node is BrowserNode<'file'> =>
  node.type === 'file';

export const isDirectoryNode = (
  node: BrowserNode
): node is BrowserNode<'directory'> => node.type === 'directory';
