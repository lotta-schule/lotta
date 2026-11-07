import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '#/test/util';
import {
  ComputerExperten,
  FaecherCategory,
  StartseiteCategory,
  VivaLaRevolucion,
} from '#/test/fixtures';
import { CategoryPage, CategoryPageProps } from './CategoryPage';

// as returned by the server: the most recently updated first
const articles = [
  { ...VivaLaRevolucion, widgets: [], isPinnedToTop: false },
  { ...ComputerExperten, widgets: [], isPinnedToTop: true },
] as unknown as CategoryPageProps['initialArticles'];

const articleTitles = (screen: ReturnType<typeof render>) =>
  screen
    .getAllByRole('heading', { level: 1 })
    .map((heading) => heading.textContent);

describe('CategoryPage', () => {
  it('shows pinned articles first', () => {
    const screen = render(
      <CategoryPage
        category={{ ...FaecherCategory, widgets: [] }}
        initialArticles={articles}
      />
    );
    expect(articleTitles(screen)).toEqual([
      ComputerExperten.title,
      VivaLaRevolucion.title,
    ]);
  });

  it('keeps the server order on the homepage', () => {
    const screen = render(
      <CategoryPage
        category={{ ...StartseiteCategory, widgets: [] }}
        initialArticles={articles}
      />
    );
    expect(articleTitles(screen)).toEqual([
      VivaLaRevolucion.title,
      ComputerExperten.title,
    ]);
  });
});
