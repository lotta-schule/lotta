import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import {
  FaecherCategory,
  StartseiteCategory,
  KunstCategory,
  ComputerExperten,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { CategoryEditor } from './CategoryEditor';
import userEvent from '@testing-library/user-event';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';
import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';
import GetArticleForPreviewQuery from 'api/query/GetArticleForPreviewQuery.graphql';

const allWidgetsMock: MockLink.MockedResponse = {
  request: {
    query: GetWidgetsQuery,
    variables: {},
  },
  result: { data: { widgets: [] } },
};
const getCategoryWidgetsMock = (
  categoryId: string,
  responseWidgets: any[] = []
): MockLink.MockedResponse => ({
  request: {
    query: GetCategoryWidgetsQuery,
    variables: { categoryId },
  },
  result: { data: { widgets: responseWidgets } },
});
const getArticlesMock = (
  categoryId: string,
  responseArticles: any[] = []
): MockLink.MockedResponse => ({
  request: {
    query: GetArticlesQuery,
    variables: { categoryId },
  },
  result: { data: { articles: responseArticles } },
});
const getArticleForPreview = (
  articleId: string,
  responseArticle: any = null
): MockLink.MockedResponse => ({
  request: {
    query: GetArticleForPreviewQuery,
    variables: { id: articleId },
  },
  result: {
    data: {
      article: responseArticle,
    },
  },
});

describe('shared/layouts/adminLayout/categoryManagment/CategoryEditor', () => {
  it('should provide correct category name in the input', () => {
    const screen = render(
      <CategoryEditor category={FaecherCategory} />,
      {},
      {
        additionalMocks: [
          allWidgetsMock,
          getCategoryWidgetsMock(FaecherCategory.id),
          getArticlesMock(FaecherCategory.id),
        ],
      }
    );

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      FaecherCategory.title
    );
  });

  describe('show/hide group selection', () => {
    it('show the GroupSelect for any non-homepage', async () => {
      const screen = render(
        <CategoryEditor category={FaecherCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(FaecherCategory.id),
            getArticlesMock(FaecherCategory.id),
          ],
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('GroupSelect')).toBeVisible();
      });
    });

    it('NOT show the GroupSelect for the homepage', async () => {
      const screen = render(
        <CategoryEditor category={StartseiteCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(StartseiteCategory.id),
            getArticlesMock(StartseiteCategory.id),
          ],
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(screen.queryByTestId('GroupSelect')).toBeNull();
    });
  });

  describe('show/hide "hide articles from homepage" selection', () => {
    it('show the "hide articles from homepage" for any non-homepage', () => {
      const screen = render(
        <CategoryEditor category={FaecherCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(FaecherCategory.id),
            getArticlesMock(FaecherCategory.id),
          ],
        }
      );

      expect(
        screen.getByRole('checkbox', {
          name: /auf der startseite verstecken/i,
        })
      ).toBeInTheDocument();
    });

    it('NOT show the "hide articles from homepage" for the homepage', () => {
      const screen = render(
        <CategoryEditor category={StartseiteCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(StartseiteCategory.id),
            getArticlesMock(StartseiteCategory.id),
          ],
        }
      );

      expect(
        screen.queryByRole('checkbox', {
          name: /auf der startseite verstecken/i,
        })
      ).toBeNull();
    });
  });

  it('should show the layout selection', () => {
    const screen = render(
      <CategoryEditor category={FaecherCategory} />,
      {},
      {
        additionalMocks: [
          allWidgetsMock,
          getCategoryWidgetsMock(FaecherCategory.id),
          getArticlesMock(FaecherCategory.id),
        ],
      }
    );

    expect(
      screen.getByRole('button', {
        name: /layout/i,
      })
    ).toBeVisible();
  });

  describe('Category redirect', () => {
    describe('"None" Value', () => {
      it('should have "NONE" selected if no redirect is set', () => {
        const screen = render(
          <CategoryEditor category={FaecherCategory} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(FaecherCategory.id),
              getArticlesMock(FaecherCategory.id),
            ],
          }
        );

        expect(
          screen.getByRole('radio', {
            name: /nicht weitergeleitet/i,
          })
        ).toBeChecked();
      });

      it('should reset the value when None is selected', async () => {
        const user = userEvent.setup();
        const screen = render(
          <CategoryEditor
            category={{
              ...FaecherCategory,
              redirect: 'https://lotta.schule',
            }}
          />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(FaecherCategory.id),
              getArticlesMock(FaecherCategory.id),
            ],
          }
        );

        await user.click(
          screen.getByRole('radio', { name: /nicht weitergeleitet/i })
        );
        expect(
          screen.getByRole('radio', { name: /nicht weitergeleitet/i })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('ExternalRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden', 'true');
        });
      });
    });

    describe('"Internal Category" Value', () => {
      const internalFaecherCategoy = {
        ...FaecherCategory,
        redirect: `/c/${KunstCategory.id}`,
      };
      it('should have "Internal Category" selected if a local path is set', async () => {
        const screen = render(
          <CategoryEditor category={internalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(internalFaecherCategoy.id),
              getArticlesMock(internalFaecherCategoy.id),
            ],
          }
        );

        expect(
          screen.getByRole('radio', {
            name: /kategorie weiterleiten/i,
          })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('InternalCategoryRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden');
        });
      });

      it('should show the category select when internal category link is selected', async () => {
        const user = userEvent.setup();
        const screen = render(
          <CategoryEditor category={internalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(internalFaecherCategoy.id),
              getArticlesMock(internalFaecherCategoy.id),
            ],
          }
        );

        await user.click(
          screen.getByRole('radio', {
            name: /kategorie weiterleiten/i,
          })
        );
        expect(
          screen.getByRole('radio', {
            name: /kategorie weiterleiten/i,
          })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('InternalCategoryRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden');
        });
      });
    });

    describe('"Internal Article" Value', () => {
      const internalFaecherCategoy = {
        ...FaecherCategory,
        redirect: `/a/${ComputerExperten.id}`,
      };
      it('should have "Internal Article" selected if a local path is set', async () => {
        const screen = render(
          <CategoryEditor category={internalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(internalFaecherCategoy.id),
              getArticlesMock(internalFaecherCategoy.id),
              getArticleForPreview(ComputerExperten.id),
            ],
          }
        );

        expect(
          screen.getByRole('radio', {
            name: /beitrag weiterleiten/i,
          })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('InternalArticleRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden');
        });
      });

      it('should show the article search when internal article link is selected', async () => {
        const user = userEvent.setup();
        const screen = render(
          <CategoryEditor category={internalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(internalFaecherCategoy.id),
              getArticlesMock(internalFaecherCategoy.id),
              getArticleForPreview(ComputerExperten.id),
            ],
          }
        );

        await user.click(
          screen.getByRole('radio', {
            name: /beitrag weiterleiten/i,
          })
        );
        expect(
          screen.getByRole('radio', {
            name: /beitrag weiterleiten/i,
          })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('InternalArticleRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden');
        });
      });
    });

    describe('"External" Value', () => {
      const externalFaecherCategoy = {
        ...FaecherCategory,
        redirect: 'https://lotta.schule',
      };

      it('should have "External" selected if a local path is set', async () => {
        const screen = render(
          <CategoryEditor category={externalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(externalFaecherCategoy.id),
              getArticlesMock(externalFaecherCategoy.id),
            ],
          }
        );

        expect(
          screen.getByRole('radio', {
            name: /im internet weiterleiten/i,
          })
        ).toBeChecked();
      });

      it('should show the textinput with a default URL when external link is selected', async () => {
        const user = userEvent.setup();
        const screen = render(
          <CategoryEditor category={externalFaecherCategoy} />,
          {},
          {
            additionalMocks: [
              allWidgetsMock,
              getCategoryWidgetsMock(externalFaecherCategoy.id),
              getArticlesMock(externalFaecherCategoy.id),
            ],
          }
        );

        await user.click(
          screen.getByRole('radio', {
            name: /im internet weiterleiten/i,
          })
        );
        expect(
          screen.getByRole('radio', {
            name: /im internet weiterleiten/i,
          })
        ).toBeChecked();

        await waitFor(() => {
          expect(
            screen.getByTestId('ExternalRedirectWrapper')
          ).not.toHaveAttribute('ariaHidden');
        });
        expect(
          screen.getByRole('textbox', {
            name: /ziel der weiterleitung/i,
          })
        ).toHaveValue('https://lotta.schule');
      });
    });
  });

  describe('update the category', () => {
    it('should update the category with correct data', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn(() => ({
        data: { category: { ...FaecherCategory, widgets: [] } },
      }));
      const screen = render(
        <CategoryEditor category={FaecherCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(FaecherCategory.id),
            getCategoryWidgetsMock(FaecherCategory.id),
            getArticlesMock(FaecherCategory.id),
            {
              request: {
                query: UpdateCategoryMutation,
                variables: {
                  id: FaecherCategory.id,
                  category: {
                    title: 'Neue Fächer',
                    bannerImageFile: null,
                    groups: [],
                    redirect: null,
                    layoutName: null,
                    hideArticlesFromHomepage: true,
                    widgets: [],
                  },
                },
              },
              result: onSave,
            },
          ],
        }
      );

      const categoryTitleInput = screen.getByRole('textbox', {
        name: /name der kategorie/i,
      }) as HTMLInputElement;
      await user.type(categoryTitleInput, 'Neue Fächer', {
        initialSelectionStart: 0,
        initialSelectionEnd: categoryTitleInput.value.length,
      });
      await user.click(
        screen.getByRole('checkbox', {
          name: /auf der startseite verstecken/i,
        })
      );
      await user.click(screen.getByRole('button', { name: /speichern/i }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });
  });

  describe('delete categories', () => {
    it('should NOT show delete button on homepage', () => {
      const screen = render(
        <CategoryEditor category={StartseiteCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(StartseiteCategory.id),
            getArticlesMock(StartseiteCategory.id),
          ],
        }
      );

      expect(screen.queryByRole('button', { name: /löschen/i })).toBeNull();
    });

    it('should show delete dialog on click', async () => {
      const user = userEvent.setup();
      const screen = render(
        <CategoryEditor category={FaecherCategory} />,
        {},
        {
          additionalMocks: [
            allWidgetsMock,
            getCategoryWidgetsMock(FaecherCategory.id),
            getArticlesMock(FaecherCategory.id),
          ],
        }
      );

      await user.click(screen.getByRole('button', { name: /löschen/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });
    });
  });
});
