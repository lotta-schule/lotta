import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import { render, waitFor } from 'test/util';
import { UserNavigationMobile } from './UserNavigationMobile';
import { SomeUser, adminGroup } from 'test/fixtures';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';
import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

describe('shared/layouts/UserNavigationMobile', () => {
  describe('logged out user', () => {
    it('should render a login and logout button', () => {
      const screen = render(<UserNavigationMobile />);
      expect(screen.queryAllByRole('button')).toHaveLength(3);
      expect(screen.queryByTestId('LoginButton')).not.toBeNull();
      expect(screen.queryByTestId('RegisterButton')).not.toBeNull();
      expect(screen.queryByTestId('SearchButton')).not.toBeNull();

      expect(screen.queryByTestId('ProfileButton')).toBeNull();
      expect(screen.queryByTestId('FeedbackButton')).toBeNull();
      expect(screen.queryByTestId('AdminButton')).toBeNull();
      expect(screen.queryByTestId('MessagingButton')).toBeNull();
    });

    it('should not render register button when email registration is disabled', () => {
      const screen = render(
        <UserNavigationMobile />,
        {},
        {
          tenant: {
            configuration: {
              isEmailRegistrationEnabled: false,
            },
          },
        }
      );

      expect(screen.queryAllByRole('button')).toHaveLength(2);
      expect(screen.queryByTestId('LoginButton')).not.toBeNull();
      expect(screen.queryByTestId('RegisterButton')).toBeNull();
      expect(screen.queryByTestId('SearchButton')).not.toBeNull();
    });
  });

  describe('non-admin user', () => {
    it('should render profile and createArticle buttons, but not admin buttons', () => {
      const screen = render(
        <UserNavigationMobile />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.queryAllByRole('button')).toHaveLength(8);
      expect(screen.queryByTestId('LoginButton')).toBeNull();
      expect(screen.queryByTestId('RegisterButton')).toBeNull();

      expect(screen.queryByTestId('SearchButton')).toBeVisible();
      expect(screen.queryByTestId('CreateArticleButton')).toBeVisible();
      expect(screen.queryByTestId('OwnArticlesButton')).toBeVisible();
      expect(screen.queryByTestId('FeedbackButton')).toBeVisible();
      expect(screen.queryByTestId('ProfileButton')).toBeVisible();
      expect(screen.queryByTestId('ProfileFilesButton')).toBeVisible();
      expect(screen.queryByTestId('MessagingButton')).toBeVisible();

      // admin and profile button should not be visible
      expect(screen.queryByTestId('AdminButton')).toBeNull();
    });
  });

  describe('admin user', () => {
    const additionalMocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetUnpublishedArticlesQuery },
        result: { data: { articles: [] } },
      },
      {
        request: { query: GetFeedbackOverviewQuery },
        result: {
          data: {
            feedbacks: [
              {
                id: '6543-feed-back-1234',
                insertedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isForwarded: false,
                isResponded: false,
                isNew: false,
              },
            ],
          },
        },
      },
    ];
    it('should render profile and createArticle buttons, and also admin buttons', () => {
      const screen = render(
        <UserNavigationMobile />,
        {},
        {
          currentUser: { ...SomeUser, groups: [adminGroup] },
          additionalMocks,
        }
      );
      expect(screen.queryAllByRole('button')).toHaveLength(10);
      expect(screen.queryByTestId('LoginButton')).toBeNull();
      expect(screen.queryByTestId('RegisterButton')).toBeNull();

      expect(screen.queryByTestId('SearchButton')).toBeVisible();
      expect(screen.queryByTestId('CreateArticleButton')).toBeVisible();
      expect(screen.queryByTestId('OwnArticlesButton')).toBeVisible();
      expect(screen.queryByTestId('FeedbackButton')).toBeVisible();
      expect(screen.queryByTestId('ProfileButton')).toBeVisible();
      expect(screen.queryByTestId('ProfileFilesButton')).toBeVisible();
      expect(screen.queryByTestId('MessagingButton')).toBeVisible();

      expect(screen.queryByTestId('ProfileButton')).toBeVisible();
      expect(screen.queryByTestId('AdminButton')).toBeVisible();
    });

    it('should show a badge when new feedback is available', async () => {
      const screen = render(
        <UserNavigationMobile />,
        {},
        {
          currentUser: { ...SomeUser, groups: [adminGroup] },
          additionalMocks,
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('FeedbackBadge')).toBeVisible();
      });
      expect(screen.getByTestId('FeedbackBadge')).toHaveTextContent('1');
    });
  });
});
