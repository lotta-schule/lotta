import { render, waitFor } from 'test/util';
import { Weihnachtsmarkt } from 'test/fixtures';
import { TagDetailsDialog } from './TagDetailsDialog';

import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

describe('TagDetailsDialog', () => {
  const additionalMocks = [
    {
      request: {
        query: GetArticlesForTag,
        variables: { tag: 'tag' },
      },
      result: {
        data: { articles: [Weihnachtsmarkt] },
      },
    },
  ];

  it('should not show when tag is null', () => {
    const screen = render(
      <TagDetailsDialog tag={null} onRequestClose={jest.fn()} />,
      {},
      {
        additionalMocks,
      }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the list of articles', async () => {
    const screen = render(
      <TagDetailsDialog tag="tag" onRequestClose={jest.fn()} />,
      {},
      {
        additionalMocks,
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText('Weitere Beiträge zum Thema: tag')).toBeVisible();
      expect(screen.getByText('Weihnachtsmarkt')).toBeVisible();
    });
  });
});
