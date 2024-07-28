import { render, waitFor } from 'test/util';
import { Weihnachtsmarkt } from 'test/fixtures';
import { ArticleReactions } from './ArticleReactions';
import userEvent from '@testing-library/user-event';

import GetArticleReactionCounts from 'api/query/GetArticleReactionCounts.graphql';
import ReactToArticleMutation from 'api/mutation/ReactToArticleMutation.graphql';

const additionalMocks = [
  {
    request: {
      query: GetArticleReactionCounts,
      variables: { id: Weihnachtsmarkt.id },
    },
    result: {
      data: {
        article: {
          id: Weihnachtsmarkt.id,
          reactionCounts: [
            { type: 'PEPPER', count: 5 },
            { type: 'LEMON', count: 3 },
          ],
        },
      },
    },
  },
  {
    request: {
      query: ReactToArticleMutation,
      variables: { id: Weihnachtsmarkt.id, reaction: 'PEPPER' },
    },
    result: {
      data: {
        reactToArticle: {
          success: true,
        },
      },
    },
  },
];

describe('ArticleReactions Component', () => {
  it('renders correctly with initial data', async () => {
    const screen = render(
      <ArticleReactions article={Weihnachtsmarkt} />,
      {},
      {
        additionalMocks,
      }
    );

    // Verify the component renders with initial data
    await waitFor(() => {
      expect(screen.getByTestId('ArticleReactions')).toBeInTheDocument();
      expect(
        screen.getByTitle(`Auf "${Weihnachtsmarkt.title}" reagieren`)
      ).toBeInTheDocument();
    });
  });

  it('opens reaction selector when button is clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <ArticleReactions article={Weihnachtsmarkt} />,
      {},
      { additionalMocks }
    );

    const reactionButton = await screen.findByTitle(
      `Auf "${Weihnachtsmarkt.title}" reagieren`
    );
    await user.click(reactionButton);

    // Assert that the reaction selector opens
    await waitFor(() =>
      expect(screen.getByTestId('ReactionSelector')).toBeInTheDocument()
    );
  });

  it('allows selecting and submitting a reaction', async () => {
    const user = userEvent.setup();
    const screen = render(
      <ArticleReactions article={Weihnachtsmarkt} />,
      {},
      { additionalMocks }
    );

    const reactionButton = await screen.findByTitle(
      `Auf "${Weihnachtsmarkt.title}" reagieren`
    );
    await user.click(reactionButton);

    const pepperReactionButton = screen.getByTestId('reaction-PEPPER');
    await user.click(pepperReactionButton);

    await waitFor(() => expect(pepperReactionButton).not.toBeInTheDocument());
  });

  it('shows reaction count buttons', async () => {
    const screen = render(
      <ArticleReactions article={Weihnachtsmarkt} />,
      {},
      { additionalMocks }
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
