import { render, waitFor } from 'test/util';
import { Article } from './Article';
import { ComputerExperten, VivaLaRevolucion } from 'test/fixtures';

import GetArticleReactionCounts from 'api/query/GetArticleReactionCounts.graphql';
import { MockLink } from '@apollo/client/testing';

const articleWithReactionsEnabled = ComputerExperten;
const articoleWithoutReactionsEnabled = VivaLaRevolucion;

const additionalMocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: GetArticleReactionCounts,
      variables: { id: articleWithReactionsEnabled.id },
    },
    result: {
      data: {
        article: {
          id: articleWithReactionsEnabled.id,
          reactionCounts: [],
        },
      },
    },
  },
];

describe('Article', () => {
  it("should show the article's title", () => {
    const screen = render(
      <Article article={ComputerExperten} />,
      {},
      { additionalMocks }
    );

    expect(screen.getByText(ComputerExperten.title)).toBeVisible();
  });

  it("should show the article's contentmodules", () => {
    const screen = render(
      <Article article={ComputerExperten} />,
      {},
      {
        additionalMocks,
      }
    );

    expect(screen.queryAllByTestId('ContentModule')).toHaveLength(
      ComputerExperten.contentModules.length
    );
  });

  describe('Reactions', () => {
    it('should show the reactions if enabled', async () => {
      const screen = render(
        <Article article={articleWithReactionsEnabled} />,
        {},
        {
          additionalMocks,
        }
      );

      await waitFor(() => {
        screen.rerender(<Article article={articleWithReactionsEnabled} />);
        expect(screen.getByTestId('ArticleReactions')).toBeVisible();
      });
    });

    it('should not show the reactions if disabled', () => {
      const screen = render(
        <Article article={articoleWithoutReactionsEnabled} />
      );

      expect(screen.queryByTestId('ArticleReactions')).toBeNull();
    });
  });
});
