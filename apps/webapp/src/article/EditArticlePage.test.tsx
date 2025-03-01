import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockRouter, render, waitFor } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { EditArticlePage } from './EditArticlePage';
import { ArticleModel, ContentModuleModel, ContentModuleType } from 'model';
import userEvent from '@testing-library/user-event';

import ArticleIsUpdatedSubscription from 'api/subscription/GetArticleSubscription.graphql';
import UpdateArticleMutation from 'api/mutation/UpdateArticleMutation.graphql';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

const additionalMocks = [
  {
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
  const createOnSave = (
    article: ArticleModel,
    inputArticle: Omit<Partial<ArticleModel>, 'contentModules'> & {
      contentModules: Partial<ContentModuleModel>[];
    },
    resultProps: Partial<ArticleModel> = {}
  ) =>
    vi.fn(() => ({
      data: {
        article: {
          ...article,
          ...inputArticle,
          contentModules: inputArticle.contentModules.map((cm) => ({
            ...cm,
            id: cm.id || (Math.random() * Number.MAX_SAFE_INTEGER).toString(),
          })),
          ...resultProps,
        },
      },
    }));

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
      const fireEvent = userEvent.setup();
      const variables = {
        id: Weihnachtsmarkt.id,
        article: {
          contentModules: Weihnachtsmarkt.contentModules
            .map((cm) => ({
              id: cm.id,
              type: cm.type,
              sortKey: cm.sortKey,
              files: cm.files,
              configuration: cm.configuration
                ? JSON.stringify(cm.configuration)
                : null,
              content: cm.content ? JSON.stringify(cm.content) : null,
            }))
            .concat([
              {
                configuration: '{}' as any,
                sortKey: 30,
                files: [],
                type: 'TITLE',
                content: '{"title":"Deine Überschrift ..."}',
              } as any,
            ]),
          users: [],
          groups: [],
          insertedAt: Weihnachtsmarkt.insertedAt,
          readyToPublish: true,
          isReactionsEnabled: false,
          published: false,
          title: 'Weihnachtsmarkt',
          preview: Weihnachtsmarkt.preview,
          previewImageFile: null,
          tags: ['La Revolucion'],
          category: null,
        },
      };
      const onSave = createOnSave(Weihnachtsmarkt, variables.article, {
        updatedAt: date.toString(),
      });
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            ...additionalMocks,
            {
              request: {
                query: UpdateArticleMutation,
                variables: variables,
              },
              result: onSave,
            },
          ],
        }
      );

      await fireEvent.click(screen.getByRole('button', { name: /titel/i }));
      await fireEvent.click(screen.getByRole('button', { name: /speichern/i }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('should redirect to article page after saving', async () => {
      const fireEvent = userEvent.setup();
      const onPushLocation = vi.fn(async (url: any) => {
        expect(url).toMatch(/^\/a\//);
        return true;
      });
      const variables = {
        id: Weihnachtsmarkt.id,
        article: {
          contentModules: Weihnachtsmarkt.contentModules
            .map((cm) => ({
              id: cm.id,
              type: cm.type,
              sortKey: cm.sortKey,
              files: cm.files,
              configuration: cm.configuration
                ? JSON.stringify(cm.configuration)
                : null,
              content: cm.content ? JSON.stringify(cm.content) : null,
            }))
            .concat([
              {
                configuration: '{}' as any,
                sortKey: 30,
                files: [],
                type: 'TITLE',
                content: '{"title":"Deine Überschrift ..."}',
              } as any,
            ]),
          users: [],
          groups: [],
          insertedAt: Weihnachtsmarkt.insertedAt,
          // updatedAt: date.toISOString(),
          readyToPublish: true,
          isReactionsEnabled: false,
          published: false,
          title: 'Weihnachtsmarkt',
          preview: Weihnachtsmarkt.preview,
          previewImageFile: null,
          tags: ['La Revolucion'],
          category: null,
        },
      };
      const onSave = createOnSave(Weihnachtsmarkt, variables.article, {
        updatedAt: date.toISOString(),
      });
      const { mockRouter } = await vi.importMock<MockRouter>('next/router');
      mockRouter.reset(`/a/${Weihnachtsmarkt.id}/edit`);
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            ...additionalMocks,
            {
              request: {
                query: UpdateArticleMutation,
                variables: variables,
              },
              result: onSave,
            },
          ],
        }
      );
      mockRouter.events.on('routeChangeStart', onPushLocation);
      await fireEvent.click(screen.getByRole('button', { name: /titel/i }));
      await fireEvent.click(screen.getByRole('button', { name: /speichern/i }));
      await waitFor(() => {
        expect(onPushLocation).toHaveBeenCalled();
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
      const fireEvent = userEvent.setup();
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
      await fireEvent.click(screen.getByRole('button', { name: /titel/i }));
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

  describe('issue warning when userAvatar navigates away', () => {
    const originalConfirm = global.confirm;
    beforeEach(async () => {
      const routerModule = await vi.importMock<{ mockRouter: MockRouter }>(
        'next/router'
      );
      routerModule.mockRouter.reset(`/c/${Weihnachtsmarkt.id}`);
      global.confirm = vi.fn(() => true);
    });
    afterEach(() => {
      global.confirm = originalConfirm;
    });

    it('should show a prompt if userAvatar has made a change', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );
      await fireEvent.type(
        screen.getByRole('textbox', { name: /title/i }),
        'Bla'
      );

      const routerModule = await vi.importMock<{ mockRouter: MockRouter }>(
        'next/router'
      );
      routerModule.mockRouter.events.emit('routeChangeStart', '/c/123');
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalled();
      });
    });

    it('should not show a prompt if userAvatar has not made changes', async () => {
      render(
        <EditArticlePage article={Weihnachtsmarkt} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );
      const routerModule = await vi.importMock<{ mockRouter: MockRouter }>(
        'next/router'
      );
      routerModule.mockRouter.events.emit('routeChangeStart', '/c/123');
      expect(global.confirm).not.toHaveBeenCalled();
    });
  });
});
