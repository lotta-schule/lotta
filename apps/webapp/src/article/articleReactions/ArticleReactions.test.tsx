import { render, waitFor, userEvent } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { ArticleReactions } from './ArticleReactions';

import GetArticleReactionCounts from 'api/query/GetArticleReactionCounts.graphql';
import GetReactionUsersQuery from 'api/query/GetReactionUsersQuery.graphql';
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
        article: {
          ...Weihnachtsmarkt,
          reactionCounts: [{ type: 'PEPPER', count: 6 }],
        },
      },
    },
  },
  {
    request: {
      query: GetReactionUsersQuery,
      variables: { id: Weihnachtsmarkt.id, reaction: 'PEPPER' },
    },
    result: {
      data: {
        users: [SomeUser],
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
        currentUser: SomeUser,
      }
    );
    screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

    // Verify the component renders with initial data
    await waitFor(() => {
      expect(screen.getByTestId('ArticleReactions')).toBeInTheDocument();
    });
  });

  describe('adding a reaction', () => {
    it('opens reaction selector when button is clicked', async () => {
      const user = userEvent.setup();
      const screen = render(
        <ArticleReactions article={Weihnachtsmarkt} />,
        {},
        { additionalMocks, currentUser: SomeUser }
      );
      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

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
        { additionalMocks, currentUser: SomeUser }
      );
      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

      const reactionButton = await screen.findByTitle(
        `Auf "${Weihnachtsmarkt.title}" reagieren`
      );
      await user.click(reactionButton);

      const pepperReactionButton = screen.getByTestId('reaction-PEPPER');
      await user.click(pepperReactionButton);

      await waitFor(() =>
        expect(screen.getByTestId('ReactionSelector')).not.toBeVisible()
      );
    });

    it('should not show the reaction button when the user is not logged in', async () => {
      const screen = render(
        <ArticleReactions article={Weihnachtsmarkt} />,
        {},
        { additionalMocks }
      );
      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

      await screen.findByTestId('ArticleReactions');

      expect(
        screen.queryByTitle(`Auf "${Weihnachtsmarkt.title}" reagieren`)
      ).toBeNull();
    });
  });

  describe('show reactions', () => {
    it('open reaction count list when clicking on reaction button', async () => {
      const user = userEvent.setup();
      const screen = render(
        <ArticleReactions article={Weihnachtsmarkt} />,
        {},
        { additionalMocks, currentUser: SomeUser }
      );
      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /5/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /3/ })).toBeInTheDocument();
      });

      const reactionButton = screen.getByRole('button', { name: /5/ });
      await user.click(reactionButton);

      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

      await waitFor(() => {
        expect(screen.getByTestId('ReactionUserList')).toBeVisible();
      });
    });

    it('should disable the reaction button when the user is not logged in', async () => {
      const screen = render(
        <ArticleReactions article={Weihnachtsmarkt} />,
        {},
        { additionalMocks }
      );
      screen.rerender(<ArticleReactions article={Weihnachtsmarkt} />);

      await screen.findByTestId('ArticleReactions');

      expect(screen.getByRole('button', { name: /5/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /3/ })).toBeDisabled();
    });
  });
});
