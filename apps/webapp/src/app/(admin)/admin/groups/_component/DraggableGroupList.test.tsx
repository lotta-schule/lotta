import { render, waitFor } from 'test/util';
import { MockedResponse } from '@apollo/client/testing';
import { lehrerGroup, schuelerGroup, userGroups } from 'test/fixtures';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Mock } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { DraggableGroupList } from './DraggableGroupList';
import { GET_USER_GROUPS } from '../_graphql';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useParams: vi.fn().mockReturnValue({ groupId: null }),
}));

describe('DraggableGroupList', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };
  const additionalMocks: MockedResponse[] = [
    {
      request: {
        query: GET_USER_GROUPS,
      },
      result: {
        data: {
          userGroups,
        },
      },
    },
  ];

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all available groups', async () => {
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockImplementation((key) => {
        if (key === 's') return 'initialSearch';
        if (key === 'sort') return 'custom';
        return null;
      }),
      entries: vi.fn().mockReturnValue([]),
    });
    const screen = render(<DraggableGroupList />, {}, { additionalMocks });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });

    expect(screen.getAllByRole('button')).toHaveLength(userGroups.length);
  });

  it('should have the current group selected', async () => {
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockImplementation((key) => {
        if (key === 's') return 'initialSearch';
        if (key === 'sort') return 'custom';
        return null;
      }),
      entries: vi.fn().mockReturnValue([]),
    });
    (useParams as Mock).mockReturnValue({
      groupId: lehrerGroup.id,
    });
    const screen = render(<DraggableGroupList />, {}, { additionalMocks });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });

    expect(screen.getByRole('button', { name: /lehrer/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.getByRole('button', { name: /schüler/i })
    ).not.toHaveAttribute('aria-current', 'page');
  });

  it('should navigated to a selected group', async () => {
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockImplementation(() => {
        return null;
      }),
      entries: vi.fn().mockReturnValue([]),
    });
    const user = userEvent.setup();
    const screen = render(<DraggableGroupList />, {}, { additionalMocks });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });

    await user.click(screen.getByRole('listitem', { name: /schüler/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/admin/groups/${schuelerGroup.id}`
      );
    });
  });
});
