import * as React from 'react';
import { render, within } from '../test-utils';
import { MockedFunction } from 'vitest';
import { NodeList } from './NodeList';
import { BrowserNode, BrowserStateProvider } from './BrowserStateContext';
import { Explorer } from './Explorer';

const rootNodes: BrowserNode[] = [
  {
    id: '1',
    name: 'folder 1',
    type: 'directory',
    parent: null,
  },
  { id: '2', name: 'folder 2', type: 'directory', parent: null },
  { id: '3', name: 'folder 3', type: 'directory', parent: null },
  { id: '4', name: 'folder 4', type: 'directory', parent: null },
];

const level1Nodes: BrowserNode[] = [
  { id: '5', name: 'folder 5', type: 'directory', parent: '1' },
  { id: '6', name: 'folder 6', type: 'directory', parent: '1' },
  { id: '7', name: 'folder 7', type: 'directory', parent: '1' },
  { id: '8', name: 'folder 8', type: 'directory', parent: '1' },
  { id: '9', name: 'folder 9', type: 'directory', parent: '1' },
  { id: '10', name: 'folder 10', type: 'directory', parent: '1' },
];

const level2Nodes: BrowserNode[] = [
  { id: '11', name: 'folder 11', type: 'directory', parent: '8' },
  { id: '12', name: 'folder 12', type: 'directory', parent: '8' },
  { id: '13', name: 'folder 13', type: 'directory', parent: '8' },
  { id: '14', name: 'folder 14', type: 'directory', parent: '8' },
  { id: '15', name: 'folder 15', type: 'file', parent: '8' },
  { id: '16', name: 'folder 16', type: 'file', parent: '8' },
  { id: '17', name: 'folder 17', type: 'file', parent: '8' },
  { id: '18', name: 'folder 18', type: 'file', parent: '8' },
];

type WrappedExplorerProps = {
  defaultPath?: BrowserNode[];
  availableNodes: BrowserNode[];
};

const WrappedExplorer = ({
  defaultPath = [],
  availableNodes,
}: WrappedExplorerProps) => (
  <BrowserStateProvider
    renderNodeList={({ parentPath }) => (
      <NodeList
        path={parentPath}
        nodes={availableNodes.filter(
          ({ parent }) => parent === (parentPath?.at(-1)?.id ?? null)
        )}
      />
    )}
    onRequestChildNodes={async () => []}
    defaultPath={defaultPath}
  >
    <Explorer />
  </BrowserStateProvider>
);

describe('Browser/Explorer', () => {
  it('should render one level deep', async () => {
    const screen = render(<WrappedExplorer availableNodes={rootNodes} />);
    expect(screen.queryAllByRole('listbox')).toHaveLength(1);

    expect(
      within(screen.queryAllByRole('listbox')[0]).getAllByRole('option')
    ).toHaveLength(rootNodes.length);
  });

  it('should render three levels deep', async () => {
    const allNodes = [...rootNodes, ...level1Nodes, ...level2Nodes];
    const path = [null, null]
      .reduce(
        (path) => {
          const nextNode = allNodes.find(
            (node) => node.id === path.at(-1)?.parent
          ) as BrowserNode;

          return [...path, nextNode];
        },
        [
          level2Nodes.at(Math.floor(Math.random() * level2Nodes.length)),
        ] as BrowserNode[]
      )
      .reverse();

    const screen = render(
      <WrappedExplorer availableNodes={allNodes} defaultPath={path} />
    );

    const scrollIntoViewMock = HTMLElement.prototype
      .scrollIntoView as MockedFunction<
      typeof HTMLElement.prototype.scrollIntoView
    >;

    const lists = screen.queryAllByRole('listbox');
    expect(lists).toHaveLength(3);

    expect(within(lists[0]).getAllByRole('option')).toHaveLength(
      rootNodes.length
    );
    expect(within(lists[1]).getAllByRole('option')).toHaveLength(
      level1Nodes.length
    );
    expect(within(lists[2]).getAllByRole('option')).toHaveLength(
      level2Nodes.length
    );

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
