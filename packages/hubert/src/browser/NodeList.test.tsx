import * as React from 'react';
import { vi } from 'vitest';
import {
  fixtures,
  render,
  TestBrowserWrapper,
  TestBrowserWrapperProps,
} from '../test-utils';
import { NodeList, NodeListProps } from './NodeList';
import { isDirectoryNode } from './utils';
import userEvent from '@testing-library/user-event';

const defaultPath = fixtures.getPathForNode('8');
const defaultNodes = fixtures.getChildNodes('8');

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

  it('scrolls into view when path length matches currentPath length', () => {
    render(<WrappedNodeList />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      inline: 'start',
      behavior: 'smooth',
    });
  });

  describe('keyboard navigation', () => {
    describe('down arrow', () => {
      it('should keep selection when first entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[defaultNodes.at(-1)!]}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowdown}');

        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should select the next item if there is one', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            selected={[defaultNodes.at(-2)!]}
            onSelect={onSelect}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{arrowdown}');

        expect(onSelect).toHaveBeenCalledWith([defaultNodes.at(-1)]);
      });

      it('should add the next item if there is one when shift is clicked, closing a potential open sibbling directory', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const onNavigate = vi.fn();
        const screen = render(
          <WrappedNodeList
            currentPath={fixtures.getPathForNode('11')}
            selected={[defaultNodes.at(1)!]}
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
          defaultNodes.at(1),
          defaultNodes.at(2),
        ]);
      });
    });

    describe('keyboard up', () => {
      it('should keep selection when last entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedNodeList
            selected={[defaultNodes.at(0)!]}
            onSelect={onSelect}
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
            selected={[defaultNodes.at(-2)!]}
            onSelect={onSelect}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{arrowup}');

        expect(onSelect).toHaveBeenCalledWith([defaultNodes.at(-3)]);
      });

      it('should add the next item if there is one when shift is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            selected={[defaultNodes.at(-2)!]}
            onSelect={onSelect}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{Shift>}{arrowup}{/Shift}');

        expect(onSelect).toHaveBeenCalledWith([
          defaultNodes.at(-2),
          defaultNodes.at(-3),
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
            selected={[defaultNodes.at(0)!]}
            path={defaultPath}
            currentPath={defaultPath}
            onNavigate={onNavigate}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowleft}');

        expect(onSelect).toHaveBeenCalledWith([defaultPath.at(-1)!]);
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
        const selected = currentDirectories.slice(0, parentIndex + 1);

        render(
          <WrappedNodeList
            selected={selected}
            onNavigate={onNavigate}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowright}');

        expect(onSelect).toHaveBeenCalledWith([targetNode]);
        expect(onNavigate).toHaveBeenCalledWith([...defaultPath]);
      });
    });

    describe('mouse', () => {
      it('should also select a range if ctrl/cmd is down when next item is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            nodes={defaultNodes}
            selected={[defaultNodes.at(1)!]}
            onSelect={onSelect}
          />
        );

        const nextNodeToSelect = defaultNodes.at(4)!;

        await user.keyboard('{meta>}');
        await user.click(
          screen.getByRole('option', { name: nextNodeToSelect.name })
        );

        expect(onSelect).toHaveBeenCalledWith([
          defaultNodes.at(1),
          defaultNodes.at(4),
        ]);
      });

      it('should select a range if shift is down when next item is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedNodeList
            nodes={defaultNodes}
            selected={[defaultNodes.at(1)!]}
            onSelect={onSelect}
          />
        );

        const nextNodeToSelect = defaultNodes.at(4)!;

        await user.keyboard('{shift>}');
        await user.click(
          screen.getByRole('option', { name: nextNodeToSelect.name })
        );

        expect(onSelect).toHaveBeenCalledWith([
          defaultNodes.at(1),
          defaultNodes.at(2),
          defaultNodes.at(3),
          defaultNodes.at(4),
        ]);
      });
    });
  });
});
