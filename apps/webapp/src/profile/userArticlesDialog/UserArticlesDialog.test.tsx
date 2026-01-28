import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  KeinErSieEsUser,
  Weihnachtsmarkt,
  Klausurenplan,
} from 'test/fixtures';
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
    {
      request: {
        query: GetArticlesByUserQuery,
        variables: { userId: SomeUserin.id },
      },
      result: {
        data: { articles: [Klausurenplan] },
      },
    },
  ];

  it('should not show when tag is null', () => {
    const screen = render(
      <UserArticlesDialog users={null} onRequestClose={vi.fn()} />,
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
      <UserArticlesDialog users={[SomeUser]} onRequestClose={onRequestClose} />,
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
      <UserArticlesDialog users={[SomeUser]} onRequestClose={vi.fn()} />,
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

  it('should list multiple users and update article list', async () => {
    const user = userEvent.setup();

    const screen = render(
      <UserArticlesDialog
        users={[SomeUser, SomeUserin, KeinErSieEsUser]}
        onRequestClose={vi.fn()}
      />,
      {},
      {
        additionalMocks,
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    expect(screen.getByRole('tablist')).toBeVisible();
    expect(screen.getAllByRole('tab')).toHaveLength(3);

    expect(screen.getByRole('tab', { name: 'Luisa Drinalda' })).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Luisa Drinalda' }));

    expect(
      screen.getByRole('dialog', { name: /Luisa Drinalda/ })
    ).toBeVisible();

    await waitFor(() => {
      expect(screen.getByText('Klausurenplan')).toBeVisible();
    });
  });
});
