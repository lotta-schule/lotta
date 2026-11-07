import * as React from 'react';
import { WidgetsList } from '../widgetsList/WidgetsList';
import { ArticlePreview } from '#/article/preview';
import { ResultOf } from '#/api/graphql';
import { Header, Main, Sidebar } from '#/layout';
import { MoreArticlesLoader } from './MoreArticlesLoader';
import { CategoryModel } from '#/model';
import { GET_ARTICLES_QUERY } from './_graphql/GET_ARTICLES_QUERY';
import clsx from 'clsx';

import styles from './CategoryPage.module.scss';

export const PREFETCH_COUNT = 10;

export type CategoryPageProps = {
  initialArticles: ResultOf<typeof GET_ARTICLES_QUERY>['articles'];
  category: CategoryModel;
};

export const CategoryPage = React.memo(
  ({ category, initialArticles }: CategoryPageProps) => {
    const twoColumnsLayout = category?.layoutName === '2-columns';
    const articles =
      initialArticles?.filter((article) => article !== null) ?? [];
    // (the date of the last article in the server's order, from which on more are loaded)
    const lastArticleDate = articles.at(-1)?.updatedAt;
    // pinned articles come first, except on the homepage
    const sortedArticles = category.isHomepage
      ? articles
      : [...articles].sort(
          (a1, a2) => Number(a2.isPinnedToTop) - Number(a1.isPinnedToTop)
        );

    return (
      <>
        <Main>
          <Header bannerImage={category.bannerImageFile || undefined}>
            <h2 data-testid="title">{category.title}</h2>
          </Header>
          <div className={styles.articles}>
            {sortedArticles.map((article) => (
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
                  loadImageEagerly
                />
              </div>
            ))}
            {articles.length >= PREFETCH_COUNT && lastArticleDate && (
              <React.Suspense fallback={null}>
                <MoreArticlesLoader
                  categoryId={category.id}
                  layout={category.layoutName ?? 'standard'}
                  lastArticleDate={lastArticleDate}
                />
              </React.Suspense>
            )}
          </div>
        </Main>
        <React.Suspense
          fallback={<Sidebar isEmpty={!category.widgets?.length} />}
        >
          <Sidebar isEmpty={!category.widgets?.length}>
            {!!category.widgets?.length && (
              <WidgetsList categoryId={category.id} />
            )}
          </Sidebar>
        </React.Suspense>
      </>
    );
  }
);
CategoryPage.displayName = 'CategoryPage';
