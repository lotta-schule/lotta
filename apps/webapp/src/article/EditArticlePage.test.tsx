import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { MockLink } from '@apollo/client/testing';
import { EditArticlePage } from './EditArticlePage';
import { ContentModuleType } from 'model';

import ArticleIsUpdatedSubscription from 'api/subscription/GetArticleSubscription.graphql';
import UpdateArticleMutation from 'api/mutation/UpdateArticleMutation.graphql';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

const additionalMocks: MockLink.MockedResponse[] = [
  {
    maxUsageCount: Infinity,
    request: {
      query: ArticleIsUpdatedSubscription,
      variables: { id: Weihnachtsmarkt.id },
    },
  },
  {
    request: {
      query: GetArticleQuery,
      variables: { id: Weihnachtsmarkt.id },
    },
    result: { data: { article: Weihnachtsmarkt } },
  },
];

describe('article/EditArticlePage', () => {
  it('should show the article', () => {
    const screen = render(
      <EditArticlePage article={Weihnachtsmarkt} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks,
      }
    );
    expect(screen.getByTestId('ArticleEditable')).toBeVisible();
  });

  it('should show the editing footer', () => {
    const screen = render(
      <EditArticlePage article={Weihnachtsmarkt} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks,
      }
    );
    expect(screen.getByTestId('EditArticleFooter')).toBeVisible();
  });

  describe('add content modules', () => {
    it('should show the "add module" bar', () => {
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );
      expect(screen.getByTestId('AddModuleBar')).toBeVisible();
    });

    it('should add a contentmodule', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );
      expect(screen.queryAllByTestId('ContentModule')).toHaveLength(3);
      await fireEvent.click(screen.getByRole('button', { name: /titel/i }));
      expect(screen.queryAllByTestId('ContentModule')).toHaveLength(4);
    });
  });

  describe('saving articles', () => {
    const date = new Date();

    beforeEach(() => {
      vi.useFakeTimers({
        now: date,
        shouldAdvanceTime: true,
      });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call saveArticle endpoint with updated content modules', async () => {
      const user = userEvent.setup();
      const onSaveArticleMock = {
        request: {
          query: UpdateArticleMutation,
          variables: (vars) =>
            vars.id === Weihnachtsmarkt.id &&
            vars.article.contentModules.length ===
              Weihnachtsmarkt.contentModules.length + 1,
        },
        result: vi.fn((vars) => ({
          data: {
            article: {
              ...Weihnachtsmarkt,
              contentModules: vars.article.contentModules.map((cm: any) => ({
                ...cm,
                id:
                  cm.id || (Math.random() * Number.MAX_SAFE_INTEGER).toString(),
              })),
              updatedAt: date.toISOString(),
            },
          },
        })),
      } satisfies MockLink.MockedResponse;
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [...additionalMocks, onSaveArticleMock],
        }
      );

      await user.click(screen.getByRole('button', { name: /titel/i }));
      expect(screen.getByRole('button', { name: /speichern/i })).toBeEnabled();
      await waitFor(() => {
        expect(screen.getAllByTestId('ContentModule').length).toEqual(
          Weihnachtsmarkt.contentModules.length + 1
        );
      });
      screen.getByRole('button', { name: /speichern/i }).click();
      await waitFor(() => {
        expect(onSaveArticleMock.result).toHaveBeenCalled();
      });
    });
  });

  describe('auto-update articles when in editing mode', () => {
    it('should update the preview when receiving update via subscription', async () => {
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            {
              request: {
                query: GetArticleQuery,
                variables: { id: Weihnachtsmarkt.id },
              },
              result: { data: { article: Weihnachtsmarkt } },
            },
            {
              request: {
                query: ArticleIsUpdatedSubscription,
                variables: { id: Weihnachtsmarkt.id },
              },
              delay: 500,
              result: () => {
                const article = {
                  ...Weihnachtsmarkt,
                  preview: 'New Preview-Text',
                };
                setTimeout(() => {
                  screen.rerender(<EditArticlePage article={article} />);
                });
                return { data: { article } };
              },
            },
          ],
        }
      );
      expect(screen.getByRole('textbox', { name: /preview/i })).toHaveValue(
        'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for subscription
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /preview/i })).toHaveValue(
          'New Preview-Text'
        );
      });
    });

    it('should update the preview when receiving update via subscription after adding a content module', async () => {
      const user = userEvent.setup();
      let didReceiveUpdate = false;
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            {
              request: {
                query: GetArticleQuery,
                variables: { id: Weihnachtsmarkt.id },
              },
              result: { data: { article: Weihnachtsmarkt } },
            },
            {
              request: {
                query: ArticleIsUpdatedSubscription,
                variables: { id: Weihnachtsmarkt.id },
              },
              delay: 500,
              result: () => {
                const article = {
                  ...Weihnachtsmarkt,
                  preview: 'New Preview-Text',
                };
                screen.rerender(<EditArticlePage article={article} />);
                didReceiveUpdate = true;
                return { data: { article } };
              },
            },
          ],
        }
      );
      expect(screen.getByRole('textbox', { name: /preview/i })).toHaveValue(
        'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
      );
      await user.click(screen.getByRole('button', { name: /titel/i }));
      await waitFor(() => {
        expect(didReceiveUpdate).toEqual(true);
      });
      expect(
        screen.getByRole('textbox', {
          name: /preview/i,
        })
      ).toHaveValue('New Preview-Text');
    });

    it('should show a dialog when receiving update including content-module change via subscription after adding a content module', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            {
              request: {
                query: GetArticleQuery,
                variables: { id: Weihnachtsmarkt.id },
              },
              result: { data: { article: Weihnachtsmarkt } },
            },
            {
              request: {
                query: ArticleIsUpdatedSubscription,
                variables: { id: Weihnachtsmarkt.id },
              },
              delay: 2000,
              result: () => {
                const article = {
                  ...Weihnachtsmarkt,
                  contentModules: Weihnachtsmarkt.contentModules.concat([
                    {
                      id: '9999999991111111110',
                      type: ContentModuleType.TITLE,
                      sortKey: 20,
                      insertedAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      files: [],
                      configuration: {},
                      content: {},
                    } as any,
                  ]),
                };
                setTimeout(() => {
                  screen.rerender(<EditArticlePage article={article} />);
                });
                return { data: { article } };
              },
            },
          ],
        }
      );

      // add a heading
      await fireEvent.click(screen.getByRole('button', { name: /titel/i }));

      // wait for subscription
      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(screen.getByRole('dialog')).toHaveTextContent(
            /beitrag.*aktualisiert/i
          );
        },
        { timeout: 4_000, interval: 250 }
      );
    }, 10_000);
  });
});
