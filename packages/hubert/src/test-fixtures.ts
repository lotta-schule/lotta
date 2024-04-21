import { BrowserNode, BrowserPath } from 'browser';

export const browserNodes: BrowserNode[] = [
  {
    id: '1',
    name: 'folder 1',
    type: 'directory',
    parent: null,
    meta: {},
  },
  { id: '2', name: 'folder 2', type: 'directory', parent: null, meta: {} },
  { id: '3', name: 'folder 3', type: 'directory', parent: null, meta: {} },
  { id: '4', name: 'folder 4', type: 'directory', parent: null, meta: {} },
  { id: '5', name: 'folder 5', type: 'directory', parent: '1', meta: {} },
  { id: '6', name: 'folder 6', type: 'directory', parent: '1', meta: {} },
  { id: '7', name: 'folder 7', type: 'directory', parent: '1', meta: {} },
  { id: '8', name: 'folder 8', type: 'directory', parent: '1', meta: {} },
  { id: '9', name: 'folder 9', type: 'directory', parent: '1', meta: {} },
  { id: '10', name: 'folder 10', type: 'directory', parent: '1', meta: {} },
  { id: '11', name: 'folder 11', type: 'directory', parent: '8', meta: {} },
  { id: '12', name: 'folder 12', type: 'directory', parent: '8', meta: {} },
  { id: '13', name: 'math', type: 'directory', parent: '8', meta: {} },
  { id: '14', name: 'folder 14', type: 'directory', parent: '8', meta: {} },
  { id: '15', name: 'folder 15', type: 'file', parent: '8', meta: {} },
  { id: '16', name: 'folder 16', type: 'file', parent: '8', meta: {} },
  { id: '17', name: 'folder 17', type: 'file', parent: '8', meta: {} },
  { id: '18', name: 'folder 18', type: 'file', parent: '8', meta: {} },
  { id: '19', name: 'presentation.ppt', type: 'file', parent: '13', meta: {} },
  { id: '20', name: 'graph-one.xlsx', type: 'file', parent: '13', meta: {} },
  { id: '21', name: 'graph-two.xlsx', type: 'file', parent: '13', meta: {} },
  { id: '22', name: 'notes.txt', type: 'file', parent: '13', meta: {} },
];

export const getPathForNode = (node: BrowserNode | 'string'): BrowserPath => {
  const path: BrowserPath = [];
  let current =
    typeof node === 'string' ? browserNodes.find((n) => n.id === node)! : node;
  if (!current) {
    throw new Error('Node not found!');
  }
  while (current) {
    path.unshift(current);
    const id = current.id;
    const parent = current.parent;
    if (parent === null) {
      break;
    }
    current = browserNodes.find((n) => n.id === parent)!;
    if (current === undefined) {
      throw new Error(
        `Parent not found for node #${id} (#${parent} does not exist)`
      );
    }
  }
  return path;
};
