import * as React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { UserArticlesDialog } from './UserArticlesDialog';

import GetArticlesByUserQuery from 'api/query/GetArticlesByUserQuery.graphql';

describe('UserArticlesDialog', () => {
  const additionalMocks = [
    {
      request: {
        query: GetArticlesByUserQuery,
        variables: { userId: SomeUser.id },
      },
      result: {
        data: { articles: [Weihnachtsmarkt] },
      },
    },
  ];

  it('should not show when tag is null', () => {
    const screen = render(
      <UserArticlesDialog user={null} onRequestClose={vi.fn()} />,
      {},
      {
        additionalMocks,
      }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the dialog when the route changes', async () => {
    const onRequestClose = vi.fn();
    const screen = render(
      <UserArticlesDialog user={SomeUser} onRequestClose={onRequestClose} />,
      {},
      {
        additionalMocks,
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    window.dispatchEvent(new PopStateEvent('popstate'));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  it('should render the list of articles', async () => {
    const screen = render(
      <UserArticlesDialog user={SomeUser} onRequestClose={vi.fn()} />,
      {},
      {
        additionalMocks,
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText(/Weitere Beiträge von Che/i)).toBeVisible();
      expect(screen.getByText('Weihnachtsmarkt')).toBeVisible();
    });
  });
});
