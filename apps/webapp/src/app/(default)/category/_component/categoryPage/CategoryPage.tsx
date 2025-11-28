import * as React from 'react';
import { WidgetsList } from '../widgetsList/WidgetsList';
import { ArticlePreview } from 'article/preview';
import { CategoryHead } from './CategoryHead';
import { ResultOf } from 'api/graphql';
import { Header, Main, Sidebar } from 'layout';
import { MoreArticlesLoader } from './MoreArticlesLoader';
import { GET_ARTICLES_QUERY } from './_graphql/GET_ARTICLES_QUERY';
import clsx from 'clsx';

import styles from './CategoryPage.module.scss';

export const PREFETCH_COUNT = 10;

export type CategoryPageProps = {
  initialArticles: ResultOf<typeof GET_ARTICLES_QUERY>[];
  category: CategoryModel;
};

export const CategoryPage = React.memo(
  ({ category, initialArticles }: CategoryPageProps) => {
    const twoColumnsLayout = category?.layoutName === '2-columns';

    return (
      <>
        <CategoryHead category={category} />
        <Main>
          <Header bannerImage={category.bannerImageFile || undefined}>
            <h2 data-testid="title">{category.title}</h2>
          </Header>
          <div className={styles.articles}>
            {initialArticles?.map((article) => (
              <div
                className={clsx(styles.gridItem, {
                  [styles['two-columns']]: twoColumnsLayout,
                })}
                key={article.id}
              >
                <ArticlePreview
                  article={article}
                  limitedHeight
                  layout={category.layoutName ?? 'standard'}
                />
              </div>
            ))}
            {initialArticles.length >= PREFETCH_COUNT && (
              <React.Suspense fallback={null}>
                <MoreArticlesLoader
                  categoryId={category.id}
                  layout={category.layoutName ?? 'standard'}
                  lastArticleDate={initialArticles.at(-1)?.updatedAt}
                />
              </React.Suspense>
            )}
          </div>
        </Main>
        <React.Suspense
          fallback={<Sidebar isEmpty={!category.widgets.length} />}
        >
          <Sidebar isEmpty={!category.widgets.length}>
            {!!category.widgets.length && (
              <WidgetsList categoryId={category.id} />
            )}
          </Sidebar>
        </React.Suspense>
      </>
    );
  }
);
CategoryPage.displayName = 'CategoryPage';
