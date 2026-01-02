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
import { DeleteDirectoryDialog } from './DeleteDirectoryDialog';

const WrappedDeleteDirectoryDialog = (props: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <DeleteDirectoryDialog />
  </TestBrowserWrapper>
);

const emptyDirectoryPath = fixtures.getPathForNode('14');
const deepNonEmptyDirectoryPath = fixtures.getPathForNode('8');

describe('Browser/DeleteDirectoryDialog', () => {
  it('should open the dialog on action and close it when aborted', async () => {
    const onSetCurrentAction = vi.fn();
    const user = userEvent.setup();
    const screen = render(<WrappedDeleteDirectoryDialog />);

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <WrappedDeleteDirectoryDialog
        currentAction={{ type: 'delete-directory', path: emptyDirectoryPath }}
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

  it('should delete an empty directory', async () => {
    const user = userEvent.setup();

    const onDeleteNode = vi.fn().mockResolvedValue(null);
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedDeleteDirectoryDialog
        currentAction={{ type: 'delete-directory', path: emptyDirectoryPath }}
        deleteNode={onDeleteNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ordner löschen/i })
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText(/dieser ordner ist leer/i)).toBeVisible();
    });

    expect(screen.queryByRole('list', { name: /dateien/i })).toBeNull();

    await user.click(
      screen.getByRole('button', { name: /endgültig löschen/i })
    );

    await waitFor(() => {
      expect(onDeleteNode).toHaveBeenCalledWith(emptyDirectoryPath.at(-1));
    });
    expect(onDeleteNode).toHaveBeenCalledTimes(1);

    await waitFor(
      () => {
        expect(onSetCurrentAction).toHaveBeenCalledWith(null);
      },
      { timeout: 1500 }
    );
  });

  it('should delete a non-empty directory with all its files and directories', async () => {
    const user = userEvent.setup();

    const onDeleteNode = vi.fn().mockResolvedValue(null);
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedDeleteDirectoryDialog
        currentAction={{
          type: 'delete-directory',
          path: deepNonEmptyDirectoryPath,
        }}
        deleteNode={onDeleteNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ordner löschen/i })
      ).toBeVisible();
    });

    expect(screen.queryByText(/dieser ordner ist leer/i)).toBeNull();

    expect(await screen.findByRole('list')).toBeVisible();
    expect(
      within(screen.getByRole('list')).getAllByRole('listitem')
    ).toHaveLength(8);
    expect(
      within(screen.getByRole('list')).getAllByRole('listitem').at(-1)
        ?.textContent
    ).toEqual('math/notes.txt');

    await user.click(
      screen.getByRole('button', { name: /endgültig löschen/i })
    );

    const childFiles = [22, 21, 20, 19, 18, 17, 16, 15].map((id) =>
      fixtures.browserNodes.find((n) => n.id === String(id))
    );
    const childDirectories = [11, 12, 13, 14].map((id) =>
      fixtures.browserNodes.find((n) => n.id === String(id))
    );

    const nodesToDelete = [
      ...childFiles,
      ...childDirectories,
      deepNonEmptyDirectoryPath.at(-1)!,
    ];

    await waitFor(() => {
      nodesToDelete.forEach((fileNode) => {
        expect(onDeleteNode).toHaveBeenCalledWith(fileNode);
      });
    });
    expect(onDeleteNode).toHaveBeenCalledTimes(nodesToDelete.length);

    await waitFor(
      () => {
        expect(onSetCurrentAction).toHaveBeenCalledWith(null);
      },
      { timeout: 2000 }
    );
  });
});
