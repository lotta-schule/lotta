import * as React from 'react';
import { render, within } from '@testing-library/react';
import { FilePreview } from './FilePreview';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
  userEvent,
} from 'test-utils';
import { BrowserPath } from './BrowserStateContext';

const WrappedNodeListItem = (props: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <FilePreview />
  </TestBrowserWrapper>
);

describe('FilePreview Component', () => {
  it('renders with no selected node', () => {
    const screen = render(<WrappedNodeListItem selected={[]} />);
    expect(screen.container).toHaveTextContent('');
  });

  describe('with a selected file node', () => {
    const node = fixtures.getNode('19');
    const nodePath = fixtures.getPathForNode(node);

    it('should show the file name', () => {
      const screen = render(<WrappedNodeListItem selected={[nodePath]} />);
      expect(screen.getByText(node.name)).toBeInTheDocument();
    });

    it('should show file action buttons and exec action onClick', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const screen = render(
        <WrappedNodeListItem
          selected={[nodePath]}
          setCurrentAction={onAction}
        />
      );
      expect(screen.getByTestId('FilePreviewActionBar')).toBeVisible();

      expect(
        within(screen.getByTestId('FilePreviewActionBar')).getAllByRole(
          'button'
        )
      ).toHaveLength(4);

      await user.click(screen.getByRole('button', { name: /umbenennen/i }));
      expect(onAction).toHaveBeenCalledWith({
        type: 'rename-node',
        path: nodePath,
      });
      onAction.mockClear();

      await user.click(screen.getByRole('button', { name: /verschieben/i }));
      expect(onAction).toHaveBeenCalledWith({
        type: 'move-nodes',
        paths: [nodePath],
      });
      onAction.mockClear();

      await user.click(screen.getByRole('button', { name: /löschen/i }));
      expect(onAction).toHaveBeenCalledWith({
        type: 'delete-files',
        paths: [nodePath],
      });
    });

    it('should not show file actions when in select mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select" selected={[nodePath]} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });

    it('should not show file actions when in select-multiple mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select-multiple" selected={[nodePath]} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });
  });

  describe('with a selected directory node', () => {
    const node = fixtures.getNode('8');
    const nodePath = fixtures.getPathForNode(node);

    it('should show the file name', () => {
      const screen = render(<WrappedNodeListItem selected={[nodePath]} />);
      expect(screen.getByText(node.name)).toBeInTheDocument();
    });

    it('should show directory actions (no download!)', () => {
      const screen = render(<WrappedNodeListItem selected={[nodePath]} />);
      expect(screen.getByTestId('FilePreviewActionBar')).toBeVisible();

      expect(
        within(screen.getByTestId('FilePreviewActionBar')).getAllByRole(
          'button'
        )
      ).toHaveLength(3);
    });

    it('should not show file actions when in select mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select" selected={[nodePath]} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });

    it('should not show file actions when in select-multiple mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select-multiple" selected={[nodePath]} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });
  });

  describe('with multiple selected files', () => {
    const nodes = [
      fixtures.getNode('19'),
      fixtures.getNode('20'),
      fixtures.getNode('21'),
    ] as const;
    const nodePaths = nodes.map(
      fixtures.getPathForNode
    ) as BrowserPath<'file'>[];

    it('should show the file count', () => {
      const screen = render(<WrappedNodeListItem selected={nodePaths} />);
      expect(screen.getByText(/3 dateien/i)).toBeVisible();
    });

    it('should show the file names', () => {
      const screen = render(<WrappedNodeListItem selected={nodePaths} />);
      nodes.forEach((node) => {
        expect(screen.getByText(node.name)).toBeVisible();
      });
    });

    it('should show file actions', () => {
      const screen = render(<WrappedNodeListItem selected={nodePaths} />);
      expect(screen.getByTestId('FilePreviewActionBar')).toBeVisible();

      expect(
        within(screen.getByTestId('FilePreviewActionBar')).getAllByRole(
          'button'
        )
      ).toHaveLength(2);
    });

    it('should not show file actions when in select mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select" selected={nodePaths} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });

    it('should not show file actions when in select-multiple mode', () => {
      const screen = render(
        <WrappedNodeListItem mode="select-multiple" selected={nodePaths} />
      );
      expect(screen.queryByTestId('FilePreviewActionBar')).toBeNull();
    });
  });

  describe('showing search results', () => {
    const node = fixtures.getNode('19');
    const nodePath = fixtures.getPathForNode(node);

    it('should show a "show" button', async () => {
      const user = userEvent.setup();
      const onSetCurrentSearchResults = vi.fn();

      const screen = render(
        <WrappedNodeListItem
          selected={[nodePath]}
          currentSearchResults={[nodePath]}
          setCurrentSearchResults={onSetCurrentSearchResults}
        />
      );
      expect(screen.getByTestId('FilePreviewActionBar')).toBeVisible();

      expect(
        within(screen.getByTestId('FilePreviewActionBar')).getByRole('button')
      ).toHaveTextContent('zur Datei');

      await user.click(
        within(screen.getByTestId('FilePreviewActionBar')).getByRole('button')
      );
    });
  });
});
