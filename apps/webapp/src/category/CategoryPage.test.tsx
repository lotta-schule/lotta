import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
  Klausurenplan,
  VivaLaRevolucion,
  MusikCategory,
  KeinErSieEsUser,
  SomeUser,
  imageFile,
} from 'test/fixtures';
import { ArticleModel, CategoryModel } from 'model';
import { MockedResponse } from '@apollo/client/testing';
import { CategoryPage } from './CategoryPage';
import { PREFETCH_COUNT } from 'pages/c/[slug]';

import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

describe('shared/article/CategoryLayout', () => {
  const categoryMocks = (
    category: CategoryModel,
    articles: ArticleModel[]
  ): MockedResponse[] => [
    {
      request: {
        query: GetArticlesQuery,
        variables: {
          categoryId: category.id,
          filter: { first: PREFETCH_COUNT },
        },
      },
      result: { data: { articles } },
    },
    {
      request: {
        query: GetCategoryWidgetsQuery,
        variables: { categoryId: MusikCategory.id },
      },
      result: { data: { widgets: [] } },
    },
  ];

  describe('Standard Category', () => {
    const articles = [Klausurenplan, VivaLaRevolucion].map(
      (partialArticle) =>
        ({
          ...partialArticle,
          users: [KeinErSieEsUser, SomeUser],
          category: MusikCategory,
        }) as ArticleModel
    );

    it('should render the category title', async () => {
      const screen = render(
        <CategoryPage categoryId={MusikCategory.id} />,
        {},
        { additionalMocks: categoryMocks(MusikCategory, articles) }
      );
      await waitFor(() => {
        expect(screen.queryByText('Musik')).toBeVisible();
      });
    });

    it('should render the category banner image', async () => {
      const category = { ...MusikCategory, bannerImageFile: imageFile };
      const screen = render(
        <CategoryPage categoryId={category.id} />,
        {},
        {
          additionalMocks: categoryMocks(
            category as any /* ignore incomplete file data */,
            articles
          ),
          categories: (categories) =>
            categories.map((c) =>
              c.id === category.id ? (category as any) : c
            ),
        }
      );
      const headerContent = await screen.findByTestId('HeaderContent');
      const image = headerContent.querySelector('img');
      expect(image).toBeVisible();
      const imageUrl = new URL(image!.srcset.split(' ')[0]);
      expect(imageUrl.pathname).toEqual('/123/banner_330');
    });

    it('should render an ArticlePreview', async () => {
      const screen = render(
        <CategoryPage categoryId={MusikCategory.id} />,
        {},
        { additionalMocks: categoryMocks(MusikCategory, articles) }
      );
      await waitFor(() => {
        expect([...screen.queryAllByTestId('ArticlePreview')]).toHaveLength(2);
      });
    });
  });
});
