import * as React from 'react';
import {
  fixtures,
  render,
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  userEvent,
  waitFor,
} from '../test-utils';
import { NodeList, NodeListProps } from './NodeList';
import { isDirectoryNode } from './utils';

const defaultPath = fixtures.getPathForNode('8');
const defaultNodes = fixtures.getChildNodes('8');
const defaultNodesPaths = defaultNodes.map((n) => fixtures.getPathForNode(n));

const WrappedNodeList = ({
  path = defaultPath,
  nodes = defaultNodes,
  ...props
}: TestBrowserWrapperProps & Partial<NodeListProps>) => (
  <TestBrowserWrapper currentPath={path} {...props}>
    <NodeList path={path} nodes={nodes} />
  </TestBrowserWrapper>
);

describe('NodeList component', () => {
  it('renders "Keine Dateien" when nodes array is empty', () => {
    const screen = render(<WrappedNodeList nodes={[]} />);
    expect(screen.getByText('Keine Dateien')).toBeVisible();
  });

  it('renders list items when nodes array is not empty', () => {
    const screen = render(<WrappedNodeList />);
    expect(screen.getAllByRole('option')).toHaveLength(defaultNodes.length);
  });

  it('should automatically unselect a file when it vanishes', async () => {
    const onSelect = vi.fn();
    const selectedNode = defaultNodes.at(-1)!;
    expect(selectedNode).toBeDefined();

    const screen = render(
      <WrappedNodeList
        selected={[fixtures.getPathForNode(selectedNode)]}
        onSelect={onSelect}
      />
    );

    expect(screen.queryAllByRole('option', { selected: true })).toHaveLength(1);
    screen.rerender(
      <WrappedNodeList
        nodes={defaultNodes.filter((n) => n.id !== selectedNode.id)}
        selected={[fixtures.getPathForNode(selectedNode)]}
        onSelect={onSelect}
        onNavigate={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith([]);
    });
  });

  describe('keyboard navigation', () => {
    describe('down arrow', () => {
      it('should keep selection when first entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[defaultNodesPaths.at(-1)!]}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowdown}');

        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should select the next item if there is one', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn((selection) => {
          console.log({ selectionIGot: selection });
        });
        const screen = render(
          <WrappedNodeList
            selected={[defaultNodesPaths.at(-2)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        console.log({
          defaultNodesMine: defaultNodes.at(-2),
          newPathIWant: defaultNodesPaths.at(-1),
          of: defaultNodes.map((n) => n.type.at(0) + '-' + n.name),
        });

        await user.keyboard('{arrowdown}');

        await waitFor(() => {
          expect(onSelect).toHaveBeenLastCalledWith([defaultNodesPaths.at(-1)]);
        });
      });

      it('should add the next item if there is one when shift is clicked, closing a potential open sibbling directory', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const onNavigate = vi.fn();
        const screen = render(
          <WrappedNodeList
            currentPath={fixtures.getPathForNode('11')}
            selected={[defaultNodesPaths.at(1)!]}
            onSelect={onSelect}
            onNavigate={onNavigate}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(1)!.name);

        await user.keyboard('{Shift>}{arrowdown}{/Shift}');

        expect(onNavigate).toHaveBeenCalledWith(fixtures.getPathForNode('8'));
        expect(onSelect).toHaveBeenCalledWith([
          defaultNodesPaths.at(1),
          defaultNodesPaths.at(2),
        ]);
      });
    });

    describe('keyboard up', () => {
      it('should keep selection when last entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[defaultNodesPaths.at(0)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        await user.keyboard('{arrowup}');

        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should select the next item if there is one', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            nodes={defaultNodes}
            selected={[defaultNodesPaths.at(-2)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{arrowup}');

        await waitFor(() => {
          expect(onSelect).toHaveBeenLastCalledWith([defaultNodesPaths.at(-3)]);
        });
      });

      it('should add the next item if there is one when shift is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            selected={[defaultNodesPaths.at(-2)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{Shift>}{arrowup}{/Shift}');

        expect(onSelect).toHaveBeenCalledWith([
          defaultNodesPaths.at(-2),
          defaultNodesPaths.at(-3),
        ]);
      });
    });

    describe('keyboard left', () => {
      it('should navigate to the current parent', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[defaultNodesPaths.at(0)!]}
            path={defaultPath}
            currentPath={defaultPath}
            onNavigate={onNavigate}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowleft}');

        expect(onSelect).toHaveBeenCalledWith([defaultPath]);
      });
    });

    describe('keyboard right', () => {
      it('should navigate into the selected directory', async () => {
        const user = userEvent.setup();
        const targetNode = defaultNodes.at(0)!;

        const parentNode = fixtures.getParentNode(targetNode)!;

        const parentNodeSibblings = fixtures.getChildNodes(
          fixtures.getParentNode(parentNode)
        );
        const parentIndex = parentNodeSibblings.findIndex(
          (n) => n.id === parentNode.id
        );
        const currentDirectories = parentNodeSibblings.filter(isDirectoryNode);
        const onNavigate = vi.fn();
        const onSelect = vi.fn();
        const selected = currentDirectories
          .slice(0, parentIndex + 1)
          .map((n) => fixtures.getPathForNode(n));

        render(
          <WrappedNodeList
            selected={selected}
            onNavigate={onNavigate}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowright}');

        expect(onSelect).toHaveBeenCalledWith([
          fixtures.getPathForNode(targetNode),
        ]);
        expect(onNavigate).toHaveBeenCalledWith([...defaultPath]);
      });
    });

    describe('keyboard ctrl/cmd+a', () => {
      it('should select all nodes when ctrl/cmd+a is pressed', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        await user.keyboard('{meta>}{a}{/meta}');

        expect(onSelect).toHaveBeenCalledWith(defaultNodesPaths);
      });

      it('should do nothing when in "select" mode', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            mode="select"
            selected={[]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        await user.keyboard('{meta>}{a}{/meta}');

        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('mouse', () => {
      describe('ctrl/cmd click', () => {
        it('should also select a range if ctrl/cmd is down when next item is clicked', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{meta>}');
          await user.click(
            screen.getByRole('option', { name: nextNodeToSelect.name })
          );
          await user.keyboard('{/meta}');

          expect(onSelect).toHaveBeenCalledWith([
            defaultNodesPaths.at(1),
            defaultNodesPaths.at(4),
          ]);
        });

        it('should also select a range if ctrl/cmd is down when next item is clicked in "select-multiple" mode', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              mode="select-multiple"
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{meta>}');
          await user.click(
            screen.getByRole('option', {
              name: new RegExp(nextNodeToSelect.name),
            })
          );
          await user.keyboard('{/meta}');

          expect(onSelect).toHaveBeenCalledWith([
            defaultNodesPaths.at(1),
            defaultNodesPaths.at(4),
          ]);
        });

        it('should selected clicked item when ctrl/cmd is down in "select" mode', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              mode="select"
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{meta>}');
          await user.click(
            screen.getByRole('option', { name: nextNodeToSelect.name })
          );
          await user.keyboard('{/meta}');

          expect(onSelect).toHaveBeenCalledWith([
            fixtures.getPathForNode(nextNodeToSelect),
          ]);
        });
      });

      describe('shift click', () => {
        it('should select a range if shift is down when next item is clicked', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{shift>}');
          await user.click(
            screen.getByRole('option', { name: nextNodeToSelect.name })
          );
          await user.keyboard('{/shift}');

          expect(onSelect).toHaveBeenCalledWith([
            defaultNodesPaths.at(1),
            defaultNodesPaths.at(2),
            defaultNodesPaths.at(3),
            defaultNodesPaths.at(4),
          ]);
        });

        it('should select a range if shift is down when next item is clicked in "select-multiple" mode', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              mode="select-multiple"
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{shift>}');
          await user.click(
            screen.getByRole('option', {
              name: new RegExp(nextNodeToSelect.name),
            })
          );
          await user.keyboard('{/shift}');

          expect(onSelect).toHaveBeenCalledWith([
            defaultNodesPaths.at(1),
            defaultNodesPaths.at(2),
            defaultNodesPaths.at(3),
            defaultNodesPaths.at(4),
          ]);
        });
        it('should selected clicked item when shift is down in "select" mode', async () => {
          const user = userEvent.setup();
          const onSelect = vi.fn();
          const screen = render(
            <WrappedNodeList
              mode="select"
              nodes={defaultNodes}
              selected={[defaultNodesPaths.at(1)!]}
              onSelect={onSelect}
            />
          );

          const nextNodeToSelect = defaultNodes.at(4)!;

          await user.keyboard('{shift>}');
          await user.click(
            screen.getByRole('option', { name: nextNodeToSelect.name })
          );
          await user.keyboard('{/shift}');

          expect(onSelect).toHaveBeenCalledWith([
            fixtures.getPathForNode(nextNodeToSelect),
          ]);
        });
      });
    });
  });
});
