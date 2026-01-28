import * as React from 'react';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  render,
  waitFor,
  within,
  fixtures,
  userEvent,
} from '../../test-utils';
import { MoveNodesDialog } from './MoveNodesDialog';

const WrappedMoveNodesDialog = (props: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <MoveNodesDialog />
  </TestBrowserWrapper>
);

const validDirectoryPath = fixtures.getPathForNode('8');

const validFilePath = fixtures.getPathForNode('15');

describe('Browser/MoveNodesDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('should open the dialog on action and close it when aborted', async () => {
    const onSetCurrentAction = vi.fn();
    const user = userEvent.setup();
    const screen = render(<WrappedMoveNodesDialog />);

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <WrappedMoveNodesDialog
        currentAction={{
          type: 'move-nodes',
          paths: [validDirectoryPath, validFilePath],
        }}
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
      <WrappedMoveNodesDialog
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
      <WrappedMoveNodesDialog
        currentAction={{
          type: 'move-nodes',
          paths: [validDirectoryPath, validFilePath],
        }}
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

    await user.fill(
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

    vi.advanceTimersByTime(2000);

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
      expect(onMoveNode).toHaveBeenCalledWith(validFilePath.at(-1), {
        id: String(fixtures.browserNodes.length + 1),
        name: 'bla',
        type: 'directory',
        parent: '1',
        meta: {},
      });
    });
    await waitFor(() => {
      expect(onMoveNode).toHaveBeenCalledWith(validDirectoryPath.at(-1), {
        id: String(fixtures.browserNodes.length + 1),
        name: 'bla',
        type: 'directory',
        parent: '1',
        meta: {},
      });
    });
  });

  it('should move the nodes', async () => {
    const user = userEvent.setup();

    const onMoveNode = vi.fn();
    const onSetCurrentAction = vi.fn();

    const screen = render(
      <WrappedMoveNodesDialog
        currentAction={{
          type: 'move-nodes',
          paths: [validDirectoryPath, validFilePath],
        }}
        moveNode={onMoveNode}
        setCurrentAction={onSetCurrentAction}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ordner verschieben/i })
      ).toBeVisible();
    });

    expect(await screen.findByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('menuitem', { name: 'folder 10' }));

    await user.click(screen.getByRole('button', { name: /verschieben/i }));

    await waitFor(() => {
      expect(onMoveNode).toHaveBeenCalledWith(
        validDirectoryPath.at(-1),
        fixtures.browserNodes.find((n) => n.id === '10')
      );
    });
  });
});
