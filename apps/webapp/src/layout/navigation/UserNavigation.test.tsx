import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import { render, waitFor, userEvent } from 'test/util';
import { UserNavigation } from './UserNavigation';
import { SomeUser, adminGroup } from 'test/fixtures';
import { useRouter } from 'next/navigation';
import { redirectTo } from 'util/browserLocation';
import { MockRouter } from 'test/mocks';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';
import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

// eslint-disable-next-line react-hooks/rules-of-hooks
const mockRouter = useRouter() as unknown as MockRouter;

const mockRouterResetter = () => mockRouter.reset('/');

describe('shared/layouts/UserNavigation', () => {
  describe('logged out user', () => {
    it('should render a functional login button', async () => {
      const user = userEvent.setup();
      const screen = render(<UserNavigation />);
      expect(screen.getByRole('button', { name: /anmelden/i })).toBeVisible();

      await user.click(screen.getByRole('button', { name: /anmelden/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /anmelden/i })).toBeVisible();
      });
    });

    it('should render a functional register button', async () => {
      const user = userEvent.setup();
      const screen = render(<UserNavigation />);
      expect(
        screen.getByRole('button', { name: /registrieren/i })
      ).toBeVisible();

      await user.click(screen.getByRole('button', { name: /registrieren/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /benutzerkonto erstellen/i })
        ).toBeVisible();
      });
    });
  });

  describe('logged-in user', () => {
    it('should not show login and register buttons', () => {
      const screen = render(<UserNavigation />, {}, { currentUser: SomeUser });

      expect(screen.queryByRole('button', { name: /anmelden/i })).toBeNull();
      expect(
        screen.queryByRole('button', { name: /registrieren/i })
      ).toBeNull();
    });

    it('should render createArticle, search and messages buttons', () => {
      const screen = render(<UserNavigation />, {}, { currentUser: SomeUser });

      expect(screen.getByRole('button', { name: /neu/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /suche/i })).toBeVisible();
      expect(
        screen.getByRole('button', { name: /nachrichten/i })
      ).toBeVisible();
    });
  });

  describe('user drop-down', () => {
    describe('for non-admin', () => {
      it('should render profile button', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: SomeUser,
            additionalMocks: [
              {
                request: { query: GetUnpublishedArticlesQuery },
                result: { data: { articles: [] } },
              },
            ],
          }
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /profil/i })).toBeVisible();
        });

        await user.click(screen.getByRole('button', { name: /profil/i }));

        await waitFor(() => {
          expect(screen.getByRole('menu', { hidden: true })).toBeVisible();
        });
        expect(
          screen.getByRole('menuitem', { name: /meine daten/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /meine dateien/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /meine beiträge/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /feedback/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /abmelden/i })
        ).toBeVisible();

        expect(
          screen.queryByRole('menuitem', { name: /administrieren/i })
        ).toBeNull();
        expect(
          screen.queryByRole('menuitem', { name: /beiträge freigeben/i })
        ).toBeNull();
      });
    });

    describe('for admin', () => {
      afterEach(mockRouterResetter);
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

      it('should render profile button', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /profil/i })).toBeVisible();
        });

        await user.click(screen.getByRole('button', { name: /profil/i }));

        await waitFor(() => {
          expect(
            screen.getByRole('menuitem', { name: /meine daten/i })
          ).toBeVisible();
        });
        expect(
          screen.getByRole('menuitem', { name: /meine dateien/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /meine beiträge/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /feedback/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /administrieren/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /beiträge freigeben/i })
        ).toBeVisible();
        expect(
          screen.getByRole('menuitem', { name: /abmelden/i })
        ).toBeVisible();
      });

      it('should show a badge when new feedback is available', async () => {
        const user = userEvent.setup();

        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));

        await waitFor(() => {
          expect(
            screen.getByRole('menuitem', { name: /administrieren/i })
          ).toBeVisible();
        });

        await waitFor(() => {
          expect(screen.getByTestId('FeedbackBadge')).toBeVisible();
        });
        expect(screen.getByTestId('FeedbackBadge')).toHaveTextContent('1');
      });

      it('should navigate to profile when clicking "Meine Daten"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(
          screen.getByRole('menuitem', { name: /meine daten/i })
        );

        await waitFor(() => {
          expect(mockRouter._push).toHaveBeenCalledWith(
            '/profile',
            '/profile',
            undefined
          );
        });
      });

      it('should navigate to files when clicking "Meine Dateien"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(
          screen.getByRole('menuitem', { name: /meine dateien/i })
        );

        await waitFor(() => {
          expect(mockRouter._push).toHaveBeenCalledWith(
            '/profile/files',
            '/profile/files',
            undefined
          );
        });
      });

      it('should navigate to own articles when clicking "Meine Beiträge"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(
          screen.getByRole('menuitem', { name: /meine beiträge/i })
        );

        await waitFor(() => {
          expect(mockRouter._push).toHaveBeenCalledWith(
            '/profile/articles',
            '/profile/articles',
            undefined
          );
        });
      });

      it('should open feedback dialog when clicking "Feedback"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(screen.getByRole('menuitem', { name: /^feedback$/i }));

        await waitFor(() => {
          expect(
            screen.getByRole('dialog', { name: /feedback/i })
          ).toBeVisible();
        });
      });

      it('should navigate to admin when clicking "Seite administrieren"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(
          screen.getByRole('menuitem', { name: /administrieren/i })
        );

        await waitFor(() => {
          expect(mockRouter._push).toHaveBeenCalledWith(
            '/admin',
            '/admin',
            undefined
          );
        });
      });

      it('should navigate to unpublished when clicking "Beiträge freigeben"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(
          screen.getByRole('menuitem', { name: /beiträge freigeben/i })
        );

        await waitFor(() => {
          expect(mockRouter._push).toHaveBeenCalledWith(
            '/unpublished',
            '/unpublished',
            undefined
          );
        });
      });

      it('should logout when clicking "Abmelden"', async () => {
        const user = userEvent.setup();
        const screen = render(
          <UserNavigation />,
          {},
          {
            currentUser: { ...SomeUser, groups: [adminGroup] },
            additionalMocks,
          }
        );

        await user.click(screen.getByRole('button', { name: /profil/i }));
        await user.click(screen.getByRole('menuitem', { name: /abmelden/i }));

        await waitFor(() => {
          expect(vi.mocked(redirectTo)).toHaveBeenCalledWith('/auth/logout');
        });
      });
    });
  });
});
