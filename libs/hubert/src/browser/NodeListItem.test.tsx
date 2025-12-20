import * as React from 'react';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
  render,
  waitFor,
  waitForPosition,
} from '../test-utils';
import { NodeListItem, NodeListItemProps } from './NodeListItem';
import userEvent from '@testing-library/user-event';
import { page } from '@vitest/browser/context';
import { BrowserPath } from './BrowserStateContext';

const directoryPath = fixtures.getPathForNode('8');
const filePath = fixtures.getPathForNode('19');

const defaultViewport = { width: 1280, height: 720 };

const WrappedNodeListItem = ({
  node,
  parentPath = fixtures
    .getPathForNode(node)
    .slice(0, -1) as BrowserPath<'directory'>,
  currentPath = parentPath,
  onClick = vi.fn(),
  isDisabled,
  isSelected,
  isEditingDisabled,
  ...props
}: TestBrowserWrapperProps &
  Partial<NodeListItemProps> &
  Pick<NodeListItemProps, 'node' | 'onClick'>) => (
  <TestBrowserWrapper currentPath={currentPath} {...props}>
    <NodeListItem
      node={node}
      parentPath={parentPath}
      onClick={onClick}
      isDisabled={isDisabled}
      isSelected={isSelected}
      isEditingDisabled={isEditingDisabled}
    />
  </TestBrowserWrapper>
);

describe('Browser/NodeListItem', () => {
  beforeEach(async () => {
    await page.viewport(defaultViewport.width, defaultViewport.height);
  });
  describe('render node', () => {
    it('should render the name of a node', () => {
      const node = filePath.at(-1)!;
      const screen = render(<WrappedNodeListItem node={node} />);

      expect(screen.getByRole('option')).toHaveAccessibleName(node.name);
    });

    it('should render a directory expanded when on the path', () => {
      const screen = render(
        <WrappedNodeListItem
          node={directoryPath.at(1)!}
          currentPath={directoryPath as BrowserPath<'directory'>}
        />
      );

      expect(screen.getByRole('option').ariaExpanded).toEqual('true');
    });

    it('should render as selected when it is', () => {
      const screen = render(
        <WrappedNodeListItem node={filePath.at(-1)!} isSelected />
      );

      expect(screen.getByRole('option')).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('option').ariaExpanded).toEqual('false');
    });

    describe('onClick', () => {
      it('should call onClick handler', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        const screen = render(
          <WrappedNodeListItem node={filePath.at(-1)!} onClick={onClick} />
        );

        await user.click(screen.getByRole('option'));

        expect(onClick).toHaveBeenCalled();
      });

      it('should not call onClick handler when disabled', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        const screen = render(
          <WrappedNodeListItem
            node={filePath.at(-1)!}
            onClick={onClick}
            isDisabled
          />
        );

        expect(screen.getByRole('option')).toHaveAttribute(
          'aria-disabled',
          'true'
        );
        await user.click(screen.getByRole('option'));

        expect(onClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('renaming', () => {
    it('should show rename-input when rename-action is active for the current node', async () => {
      const screen = render(
        <WrappedNodeListItem
          node={filePath[2]}
          currentAction={{ type: 'rename-node', path: filePath.slice(0, 3) }}
        />
      );

      expect(
        screen.getByRole('textbox', { name: /math umbenennen/i })
      ).toBeVisible();
    });
  });

  describe('menu button', () => {
    it('should show the menu button on directories on mobile', async () => {
      await page.viewport(393, 851);

      const screen = render(
        <WrappedNodeListItem node={directoryPath.at(-1)!} />
      );

      expect(screen.getByRole('button', { name: /ordnermenü/i })).toBeVisible();
    });

    it('should not show the menu button on files on mobile', async () => {
      await page.viewport(393, 851);

      const screen = render(<WrappedNodeListItem node={filePath.at(-1)!} />);

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });

    it('should not show the menu button on directories on desktop', async () => {
      const screen = render(
        <WrappedNodeListItem node={directoryPath.at(-1)!} />
      );

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });

    it('should not show the menu button on directories on mobile when the node is disabled', async () => {
      await page.viewport(393, 851);

      const screen = render(
        <WrappedNodeListItem node={directoryPath.at(-1)!} isDisabled />
      );

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });

    it('should not show the menu button on directories on mobile when in "select" mode', async () => {
      await page.viewport(393, 851);

      const screen = render(
        <WrappedNodeListItem mode="select" node={directoryPath.at(-1)!} />
      );

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });

    it('should not show the menu button on directories on mobile when in "select-multiple" mode', async () => {
      await page.viewport(393, 851);

      const screen = render(
        <WrappedNodeListItem
          mode="select-multiple"
          node={directoryPath.at(-1)!}
        />
      );

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });

    it('should not show the menu button on directories on mobile when "isEditingDisabled" prop is passed', () => {
      const screen = render(
        <WrappedNodeListItem
          mode="select"
          node={directoryPath.at(-1)!}
          isEditingDisabled
        />
      );

      expect(screen.queryByRole('button', { name: /ordnermenü/i })).toBeNull();
    });
  });

  describe('context menu', () => {
    it('should show the context menu on right click', async () => {
      const user = userEvent.setup();
      const screen = render(<WrappedNodeListItem node={filePath.at(-1)!} />);

      await waitForPosition();

      await user.pointer({
        keys: '[MouseRight>]',
        target: screen.getByRole('option'),
      });

      await waitFor(() => {
        expect(
          screen.getByRole('menu', { name: /kontextmenü/i })
        ).toBeVisible();
      });
    });

    it('should show rename-input when rename-action is active for the current node', async () => {
      const screen = render(
        <WrappedNodeListItem
          node={filePath[3]}
          currentAction={{
            type: 'rename-node',
            path: filePath,
          }}
        />
      );

      expect(
        screen.getByRole('textbox', { name: /presentation.ppt umbenennen/i })
      ).toBeVisible();
    });

    it('should not show the context menu on right click when the node is disabled', async () => {
      const user = userEvent.setup();
      const screen = render(
        <WrappedNodeListItem node={filePath.at(-1)!} isDisabled />
      );

      await user.pointer({
        keys: '[MouseRight>]',
        target: screen.getByRole('option'),
      });

      expect(screen.queryByRole('menu', { name: /kontextmenü/i })).toBeNull();
    });

    it('should not show the context menu on right click when the node has props "isEditingDisabled"', async () => {
      const user = userEvent.setup();
      const screen = render(
        <WrappedNodeListItem node={filePath.at(-1)!} isEditingDisabled />
      );

      await user.pointer({
        keys: '[MouseRight>]',
        target: screen.getByRole('option'),
      });

      expect(screen.queryByRole('menu', { name: /kontextmenü/i })).toBeNull();
    });

    it('should not show the context menu on right click when in "select" mode', async () => {
      const user = userEvent.setup();
      const screen = render(
        <WrappedNodeListItem mode="select" node={filePath.at(-1)!} />
      );

      await user.pointer({
        keys: '[MouseRight>]',
        target: screen.getByRole('option'),
      });

      expect(screen.queryByRole('menu', { name: /kontextmenü/i })).toBeNull();
    });

    it('should not show the context menu on right click when in "select-multiple" mode', async () => {
      const user = userEvent.setup();
      const screen = render(
        <WrappedNodeListItem mode="select-multiple" node={filePath.at(-1)!} />
      );

      await user.pointer({
        keys: '[MouseRight>]',
        target: screen.getByRole('option'),
      });

      expect(screen.queryByRole('menu', { name: /kontextmenü/i })).toBeNull();
    });
  });

  describe('checkbox', () => {
    it('should not show a checkbox on files in "view-and-edit" mode', () => {
      const screen = render(
        <WrappedNodeListItem node={filePath.at(-1)!} mode="view-and-edit" />
      );

      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('should not show a checkbox on files in "select" mode', () => {
      const screen = render(
        <WrappedNodeListItem node={filePath.at(-1)!} mode="view-and-edit" />
      );

      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('should show a checkbox on files in "select-multiple" mode and add to selection when selected', async () => {
      const otherNodePath = fixtures.getPathForNode('20');
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const screen = render(
        <WrappedNodeListItem
          node={filePath.at(-1)!}
          mode="select-multiple"
          selected={[otherNodePath]}
          onSelect={onSelect}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();

      await user.click(screen.getByRole('checkbox'));

      expect(onSelect).toHaveBeenCalledWith([otherNodePath, filePath]);
    });

    it('should show a selected checkbox on selected files in "select-multiple" mode and remove from selection when selected', async () => {
      const otherNodePath = fixtures.getPathForNode('20');
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const screen = render(
        <WrappedNodeListItem
          node={filePath.at(-1)!}
          mode="select-multiple"
          selected={[otherNodePath, filePath]}
          onSelect={onSelect}
          isSelected
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();

      await user.click(screen.getByRole('checkbox'));

      expect(onSelect).toHaveBeenCalledWith([otherNodePath]);
    });
  });
});
