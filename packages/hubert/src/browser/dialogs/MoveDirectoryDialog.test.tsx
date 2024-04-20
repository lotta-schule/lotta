import * as React from 'react';
import { vi } from 'vitest';
import { render, waitFor, within } from '../../test-utils';
import {
  BrowserNode,
  BrowserState,
  BrowserStateContext,
} from '../BrowserStateContext';
import { MoveDirectoryDialog } from './MoveDirectoryDialog';
import userEvent from '@testing-library/user-event';

const defaultNodes: BrowserNode[] = [
  {
    id: '1',
    name: 'folder 1',
    type: 'directory',
    parent: null,
  },
  { id: '2', name: 'folder 2', type: 'directory', parent: null },
  { id: '3', name: 'folder 3', type: 'directory', parent: null },
  { id: '4', name: 'folder 4', type: 'directory', parent: null },
  { id: '5', name: 'folder 5', type: 'directory', parent: '1' },
  { id: '6', name: 'folder 6', type: 'directory', parent: '1' },
  { id: '7', name: 'folder 7', type: 'directory', parent: '1' },
  { id: '8', name: 'folder 8', type: 'directory', parent: '1' },
  { id: '9', name: 'folder 9', type: 'directory', parent: '1' },
  { id: '10', name: 'folder 10', type: 'directory', parent: '1' },
  { id: '11', name: 'folder 11', type: 'directory', parent: '8' },
  { id: '12', name: 'folder 12', type: 'directory', parent: '8' },
  { id: '13', name: 'folder 13', type: 'directory', parent: '8' },
  { id: '14', name: 'folder 14', type: 'directory', parent: '8' },
  { id: '15', name: 'folder 15', type: 'file', parent: '8' },
  { id: '16', name: 'folder 16', type: 'file', parent: '8' },
  { id: '17', name: 'folder 17', type: 'file', parent: '8' },
  { id: '18', name: 'folder 18', type: 'file', parent: '8' },
];

const validDirectoryPath = ['1', '8'].map(
  (id) => defaultNodes.find((n) => n.id === id)!
);

const validFilePath = [...validDirectoryPath, defaultNodes[14]];

export type WrappedMoveDirectoryDialogProps = Partial<
  Omit<BrowserState, 'onRequestChildNodes' | 'renderNodeList' | 'mode'>
>;

const WrappedMoveDirectoryDialog = ({
  moveNode = vi.fn(),
  currentPath = [],
  setCurrentAction = vi.fn(),
  currentAction = null,
}: WrappedMoveDirectoryDialogProps) => {
  const [nodes, setNodes] = React.useState<BrowserNode[]>(defaultNodes);
  return (
    <BrowserStateContext.Provider
      value={{
        onRequestChildNodes: async (node) =>
          nodes.filter((n) => n.parent === (node?.id ?? null)),
        renderNodeList: () => null,
        currentAction,
        onSelect: vi.fn(),
        onNavigate: vi.fn(),
        currentPath,
        selected: [],
        mode: 'view-and-edit',
        setCurrentAction,
        moveNode,
        createDirectory: async (parentNode, name) => {
          setNodes((nodes) => {
            return [
              ...nodes,
              {
                id: `${nodes.length + 1}`,
                name,
                type: 'directory',
                parent: parentNode?.id ?? null,
              },
            ];
          });
        },
      }}
    >
      <MoveDirectoryDialog />
    </BrowserStateContext.Provider>
  );
};

describe('Browser/MoveDirectoryDialog', () => {
  it('should open the dialog on action and close it when aborted', async () => {
    const onSetCurrentAction = vi.fn();
    const user = userEvent.setup();
    const screen = render(<WrappedMoveDirectoryDialog />);

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <WrappedMoveDirectoryDialog
        currentAction={{ type: 'move-node', path: validDirectoryPath }}
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
      <WrappedMoveDirectoryDialog
        currentAction={null}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should open the "create new directory" dialog when clicking "new directory", and create a new directory in the current path\'s parent', async () => {
    const user = userEvent.setup();
    const onMoveNode = vi.fn();

    const screen = render(
      <WrappedMoveDirectoryDialog
        currentAction={{ type: 'move-node', path: validDirectoryPath }}
        moveNode={onMoveNode}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ordner verschieben/i })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /ordner erstellen/i }));

    const createNewDirectoryDialog = screen.getByRole('dialog', {
      name: /neuen ordner erstellen/i,
    });
    await waitFor(() => {
      expect(createNewDirectoryDialog).toBeVisible();
    });

    await user.type(
      within(createNewDirectoryDialog).getByLabelText(/name des ordners/i),
      'bla'
    );

    await user.click(
      within(
        screen.getByRole('dialog', {
          name: /neuen ordner erstellen/i,
        })
      ).getByRole('button', {
        name: /ordner.*erstellen/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /neuen ordner erstellen/i,
        })
      ).toBeNull();
    });

    expect(screen.getByRole('menu', { name: /folder 1/ })).toBeVisible();

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'bla' })).toBeVisible();
    });
    expect(screen.getAllByRole('menuitem')).toHaveLength(7);
    expect(screen.queryByRole('menuitem', { name: /folder 8/ })).toBeNull();
    expect(screen.getAllByRole('menuitem')[0]).toHaveTextContent('..');

    await user.click(screen.getByRole('menuitem', { name: 'bla' }));

    await waitFor(() => {
      expect(screen.getByRole('menu', { name: /bla/ })).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /verschieben/i }));

    await waitFor(() => {
      expect(onMoveNode).toHaveBeenCalledWith(validDirectoryPath.at(-1), {
        id: String(defaultNodes.length + 1),
        name: 'bla',
        type: 'directory',
        parent: '1',
      });
    });
  });

  it('should move the node', async () => {
    const user = userEvent.setup();

    const onMoveNode = vi.fn();
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedMoveDirectoryDialog
        currentAction={{ type: 'move-node', path: validDirectoryPath }}
        moveNode={onMoveNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ordner verschieben/i })
      ).toBeVisible();
    });

    expect(screen.getByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('menuitem', { name: 'folder 10' }));

    await user.click(screen.getByRole('button', { name: /verschieben/i }));

    await waitFor(() => {
      expect(onMoveNode).toHaveBeenCalledWith(
        validDirectoryPath.at(-1),
        defaultNodes.find((n) => n.id === '10')
      );
    });
  });

  it('should move a file', async () => {
    const user = userEvent.setup();

    const onMoveNode = vi.fn();
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedMoveDirectoryDialog
        currentAction={{ type: 'move-node', path: validFilePath }}
        moveNode={onMoveNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /datei verschieben/i })
      ).toBeVisible();
    });

    expect(screen.getByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('menuitem', { name: /folder 12/ }));

    await user.click(screen.getByRole('button', { name: /verschieben/i }));

    await waitFor(() => {
      expect(onMoveNode).toHaveBeenCalledWith(
        validFilePath.at(-1),
        defaultNodes.find((n) => n.id === '12')
      );
    });
  });
});
