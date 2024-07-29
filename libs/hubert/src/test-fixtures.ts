import { BrowserNode, BrowserPath } from 'browser';

export const browserNodes = [
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
  {
    id: '15',
    name: 'ich.jpg',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/jpg', size: 1234 },
  },
  {
    id: '16',
    name: 'ich-bgblau.jpg',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/jpg', size: 2134 },
  },
  {
    id: '17',
    name: 'avatar-ernst.webp',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/webp', size: 512 },
  },
  {
    id: '18',
    name: 'avatar-anime.png',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/png', size: 8539 },
  },
  {
    id: '19',
    name: 'presentation.ppt',
    type: 'file',
    parent: '13',
    meta: {
      size: 1024,
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
  },
  {
    id: '20',
    name: 'graph-one.xlsx',
    type: 'file',
    parent: '13',
    meta: {
      size: 1311234,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
  {
    id: '21',
    name: 'graph-two.xlsx',
    type: 'file',
    parent: '13',
    meta: {
      size: 828574,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
  {
    id: '22',
    name: 'notes.txt',
    type: 'file',
    parent: '13',
    meta: { size: 87, mimeType: 'text/plain' },
  },
] as const satisfies BrowserNode[];

type BrowserNodeFixture = (typeof browserNodes)[number];
type AnyType = 'directory' | 'file';
type BrowserNodeFixtureId<T extends AnyType = AnyType> = Extract<
  BrowserNodeFixture,
  { type: T }
>['id'];
type NodeOrNodeId<
  T extends 'directory' | 'any' = 'any',
  G extends AnyType = T extends 'directory' ? 'directory' : AnyType,
> = BrowserNode<G> | BrowserNodeFixtureId<G>;
type GetNodeType<T extends NodeOrNodeId> =
  T extends BrowserNode<infer G>
    ? G
    : T extends BrowserNodeFixtureId
      ? GetNodeFixtureIdType<T>
      : never;
type GetNodeFixtureIdType<
  ID extends BrowserNodeFixtureId,
  G extends AnyType = Extract<BrowserNodeFixture, { id: ID }>['type'],
> = G extends 'directory' ? 'directory' : AnyType;

type Node<T extends BrowserNodeFixtureId> = Extract<
  BrowserNodeFixture,
  { id: T }
>;
export const getNode = <ID extends BrowserNodeFixtureId>(id: ID): Node<ID> =>
  browserNodes.find((n) => n.id === id)! as Node<ID>;

export const getChildNodes = <T extends NodeOrNodeId<'directory'> | null>(
  node: T
): BrowserNode[] =>
  browserNodes.filter(
    (n) => n.parent === (typeof node === 'string' ? node : (node?.id ?? null))
  ) as any;

export const getParentNode = <T extends NodeOrNodeId>(
  node: T
): BrowserNode<'directory'> | null => {
  const id = typeof node === 'string' ? node : node.id;
  const parent = browserNodes.find((n) => n.id === id)?.parent;
  return parent === null
    ? null
    : (browserNodes.find((n) => n.id === parent) as BrowserNode<'directory'>);
};

export const getPathForNode = <T extends NodeOrNodeId>(
  node: T
): BrowserPath<GetNodeType<T>> => {
  const path: BrowserPath = [];
  let current: any =
    typeof node === 'string' ? browserNodes.find((n) => n.id === node)! : node;
  if (!current || typeof current === 'string') {
    throw new Error('Node not found!');
  }
  while (current) {
    path.unshift(current);
    const id = current.id;
    const parent: string | null = current.parent;
    if (parent === null) {
      break;
    }
    current = browserNodes.find(
      (n) => n.id === parent
    )! as BrowserNode<'directory'>;
    if (current === undefined) {
      throw new Error(
        `Parent not found for node #${id} (#${parent} does not exist)`
      );
    }
  }
  return path as BrowserPath as any;
};
