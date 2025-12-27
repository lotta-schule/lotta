import { render, fireEvent, waitFor, userEvent } from 'test/util';
import { GroupListToolbar } from './GroupListToolbar';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';
import { Mock, MockedFunction } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('./CreateUserGroupDialog', () => ({
  CreateUserGroupDialog: vi.fn(() => null),
}));

describe('GroupListToolbar', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue(mockRouter);
    (usePathname as Mock).mockReturnValue('/admin/groups');
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockImplementation((key) => {
        if (key === 's') return 'initialSearch';
        if (key === 'sort') return 'custom';
        return null;
      }),
      entries: vi.fn().mockReturnValue([]),
    });
    (
      CreateUserGroupDialog as MockedFunction<typeof CreateUserGroupDialog>
    ).mockImplementation(({ isOpen, onConfirm, onAbort }) =>
      isOpen ? (
        <div data-testid="dialog">
          <button onClick={() => onConfirm({ id: '1' } as any)}>Confirm</button>
          <button onClick={onAbort}>Abort</button>
        </div>
      ) : null
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates the searchText state and URL when typing in the search input', async () => {
    const user = userEvent.setup();
    const screen = render(<GroupListToolbar />);
    const input = screen.getByLabelText(/suche/i);

    expect(input).toHaveValue('initialSearch');

    await user.fill(input, 'New Group');

    expect(input).toHaveValue('New Group');
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/admin/groups?s=New+Group'
    );
  });

  it('updates the sorting state and URL when selecting a new sorting option', () => {
    const screen = render(<GroupListToolbar />);
    const select = screen.container.querySelector('select')!;

    fireEvent.change(select, { target: { value: 'name' } });

    expect(select).toHaveValue('name');
    expect(mockRouter.replace).toHaveBeenCalledWith('/admin/groups?sort=name');
  });

  describe('Create a new group', () => {
    it('opens the create group dialog when "Gruppe erstellen" button is clicked', async () => {
      const user = userEvent.setup();
      const screen = render(<GroupListToolbar />);
      expect(screen.queryByTestId('dialog')).toBeNull();

      await user.click(screen.getByRole('button', { name: /erstellen/ }));

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('navigates to the new group URL after creating a group', async () => {
      const user = userEvent.setup();
      const screen = render(<GroupListToolbar />);

      await user.click(screen.getByRole('button', { name: /erstellen/ }));
      await user.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/groups/1');
      });
    });

    it('closes the dialog when aborting group creation', async () => {
      const user = userEvent.setup();
      const screen = render(<GroupListToolbar />);

      await user.click(screen.getByRole('button', { name: /erstellen/ }));
      await user.click(screen.getByText('Abort'));

      expect(screen.queryByTestId('dialog')).toBeNull();
    });
  });
});
