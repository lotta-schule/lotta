import * as React from 'react';
import { ComputerExperten, VivaLaRevolucion } from 'test/fixtures';
import { render, userEvent, waitFor } from 'test/util';
import { ReviewArticlesStep } from './ReviewArticlesStep';
import { GET_OWN_ARTICLES } from '../queries';

describe('profile/deleteUserProfilePage/steps/ReviewArticlesStep', () => {
  const mockArticles = [
    { ...ComputerExperten, published: true },
    { ...VivaLaRevolucion, published: false },
  ];

  it('should show published articles count and list', async () => {
    const screen = render(
      <ReviewArticlesStep onNext={vi.fn()} onPrevious={vi.fn()} />,
      {},
      {
        additionalMocks: [
          {
            request: { query: GET_OWN_ARTICLES },
            result: {
              data: {
                articles: mockArticles,
              },
            },
          },
        ],
        withCache: (cache) => {
          cache.writeQuery({
            query: GET_OWN_ARTICLES,
            data: { articles: mockArticles },
          });
          return cache;
        },
      }
    );

    await waitFor(() => {
      expect(screen.getAllByText('1')[0]).toBeVisible();
      expect(screen.getByText(/veröffentlichten/i)).toBeVisible();
    });
    expect(screen.getByText('Computerexperten')).toBeVisible();
  });

  it('should render articles list component', async () => {
    const screen = render(
      <ReviewArticlesStep onNext={vi.fn()} onPrevious={vi.fn()} />,
      {},
      {
        additionalMocks: [
          {
            request: { query: GET_OWN_ARTICLES },
            result: { data: { articles: [] } },
          },
        ],
        withCache: (cache) => {
          cache.writeQuery({
            query: GET_OWN_ARTICLES,
            data: { articles: [] },
          });
          return cache;
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('0', { exact: false })).toBeVisible();
      expect(screen.getByText(/veröffentlichten/i)).toBeVisible();
    });
  });

  it('should show back and next navigation buttons', async () => {
    const screen = render(
      <ReviewArticlesStep onNext={vi.fn()} onPrevious={vi.fn()} />,
      {},
      {
        additionalMocks: [
          {
            request: { query: GET_OWN_ARTICLES },
            result: { data: { articles: [] } },
          },
        ],
        withCache: (cache) => {
          cache.writeQuery({
            query: GET_OWN_ARTICLES,
            data: { articles: [] },
          });
          return cache;
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    });
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should call callbacks when navigation buttons clicked', async () => {
    const fireEvent = userEvent.setup();
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const screen = render(
      <ReviewArticlesStep onNext={onNext} onPrevious={onPrevious} />,
      {},
      {
        additionalMocks: [
          {
            request: { query: GET_OWN_ARTICLES },
            result: { data: { articles: [] } },
          },
        ],
        withCache: (cache) => {
          cache.writeQuery({
            query: GET_OWN_ARTICLES,
            data: { articles: [] },
          });
          return cache;
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    });

    await fireEvent.click(screen.getByRole('button', { name: /zurück/i }));
    expect(onPrevious).toHaveBeenCalledOnce();

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
