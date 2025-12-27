import * as React from 'react';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
  render,
  userEvent,
  waitFor,
  within,
} from '../../test-utils';
import { DeleteFilesDialog } from './DeleteFilesDialog';

const WrappedDeleteDirectoryDialog = (props: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <DeleteFilesDialog />
  </TestBrowserWrapper>
);

const files = fixtures.browserNodes.filter(
  (node) => node.type === 'file' && node.parent === '8'
);
const filePaths = files.map((file) => fixtures.getPathForNode(file.id));

describe('Browser/DeleteFilesDialog', () => {
  it('should open the dialog on action and close it when aborted', async () => {
    const onSetCurrentAction = vi.fn();
    const user = userEvent.setup();
    const screen = render(<WrappedDeleteDirectoryDialog />);

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <WrappedDeleteDirectoryDialog
        currentAction={{ type: 'delete-files', paths: [] }}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onSetCurrentAction).toHaveBeenCalledWith(null);
    });

    screen.rerender(
      <WrappedDeleteDirectoryDialog
        currentAction={null}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should delete one node', async () => {
    const user = userEvent.setup();

    const onDeleteNode = vi.fn().mockResolvedValue(null);
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedDeleteDirectoryDialog
        currentAction={{ type: 'delete-files', paths: [filePaths[0]] }}
        deleteNode={onDeleteNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /dateien löschen/i })
      ).toBeVisible();
    });

    expect(screen.getByRole('list', { name: /dateien/i })).toBeVisible();
    expect(
      within(screen.getByRole('list', { name: /dateien/i })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(1);

    await user.click(
      screen.getByRole('button', { name: /endgültig löschen/i })
    );

    await waitFor(() => {
      expect(onDeleteNode).toHaveBeenCalledWith(files[0]);
    });
    expect(onDeleteNode).toHaveBeenCalledTimes(1);

    await waitFor(
      () => {
        expect(onSetCurrentAction).toHaveBeenCalledWith(null);
      },
      { timeout: 2000 }
    );
  });

  it('should delete multiple nodes', async () => {
    const user = userEvent.setup();

    const onDeleteNode = vi.fn().mockResolvedValue(null);
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedDeleteDirectoryDialog
        currentAction={{ type: 'delete-files', paths: filePaths }}
        deleteNode={onDeleteNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /dateien löschen/i })
      ).toBeVisible();
    });

    expect(screen.getByRole('list', { name: /dateien/i })).toBeVisible();
    expect(
      within(screen.getByRole('list', { name: /dateien/i })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(4);

    await user.click(
      screen.getByRole('button', { name: /endgültig löschen/i })
    );

    await waitFor(() => {
      files.forEach((fileNode) => {
        expect(onDeleteNode).toHaveBeenCalledWith(fileNode);
      });
    });
    expect(onDeleteNode).toHaveBeenCalledTimes(files.length);

    await waitFor(
      () => {
        expect(onSetCurrentAction).toHaveBeenCalledWith(null);
      },
      { timeout: 2000 }
    );
  });
});
