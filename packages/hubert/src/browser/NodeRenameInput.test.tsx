import * as React from 'react';
import { vi } from 'vitest';
import { render, waitFor } from '../test-utils';
import {
  BrowserPath,
  BrowserStateProvider,
  BrowserStateProviderProps,
} from './BrowserStateContext';
import { NodeRenameInput, NodeRenameInputProps } from './NodeRenameInput';
import userEvent from '@testing-library/user-event';

type WrappedNodeRenameInputProps = NodeRenameInputProps & {
  renameNode: BrowserStateProviderProps['renameNode'];
};

const filePath: BrowserPath = [
  { id: '1', name: 'file.jpg', type: 'file', parent: null },
];

const WrappedNodeRenameInput = ({
  renameNode,
  ...props
}: WrappedNodeRenameInputProps) => (
  <BrowserStateProvider
    renderNodeList={() => null}
    renameNode={renameNode}
    onRequestChildNodes={async () => []}
  >
    <NodeRenameInput {...props} />
  </BrowserStateProvider>
);

describe('Browser/NodeRenameInput', () => {
  it('should render an input and have focus', () => {
    const screen = render(
      <WrappedNodeRenameInput
        renameNode={vi.fn()}
        onRequestClose={vi.fn()}
        path={filePath}
      />
    );

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('textbox')).toHaveValue('file.jpg');
  });

  it('should rename the file, then call onRequestClose', async () => {
    const user = userEvent.setup();
    let resolve = () => {};
    const renameNode = vi.fn(() => new Promise((r) => (resolve = r)) as any);
    const onRequestClose = vi.fn();
    const screen = render(
      <WrappedNodeRenameInput
        renameNode={renameNode}
        onRequestClose={onRequestClose}
        path={filePath}
      />
    );

    user.type(screen.getByRole('textbox'), 'new name.jpg{enter}', {
      skipClick: true,
      initialSelectionStart: 0,
      initialSelectionEnd: filePath[0].name.length,
    });

    await waitFor(() => {
      expect(renameNode).toHaveBeenCalledWith(filePath[0], 'new name.jpg');
    });
    expect(screen.getByRole('textbox')).toHaveProperty('readOnly', true);
    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(onRequestClose).not.toHaveBeenCalled();

    resolve();
    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  it('should show the error message when there was a problem', async () => {
    const user = userEvent.setup();
    let reject = () => {};
    const renameNode = vi.fn(() => new Promise((_, r) => (reject = r)) as any);
    const onRequestClose = vi.fn();
    const screen = render(
      <WrappedNodeRenameInput
        renameNode={renameNode}
        onRequestClose={onRequestClose}
        path={filePath}
      />
    );

    user.type(screen.getByRole('textbox'), 'new name.jpg{enter}', {
      skipClick: true,
      initialSelectionStart: 0,
      initialSelectionEnd: filePath[0].name.length,
    });

    await waitFor(() => {
      expect(renameNode).toHaveBeenCalledWith(filePath[0], 'new name.jpg');
    });

    reject(new Error('Invalid name!'));
    await waitFor(() => {
      expect(screen.getByText('Invalid name!')).toBeVisible();
    });

    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
