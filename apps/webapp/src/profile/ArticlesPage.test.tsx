import * as React from 'react';
import { render, within } from 'test/util';
import {
  ComputerExperten,
  VivaLaRevolucion,
  Schulfest,
  Weihnachtsmarkt,
  Klausurenplan,
} from 'test/fixtures';
import { ArticlesPage } from './ArticlesPage';

describe('pages/profiles/articles', () => {
  it('should render a ProfileArticles without error', async () => {
    const articles = [
      Weihnachtsmarkt,
      Klausurenplan,
      Schulfest,
      VivaLaRevolucion,
      ComputerExperten,
    ];
    const screen = render(
      <ArticlesPage articles={articles} error={null} />,
      {},
      {}
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/beiträge/i);

    expect(screen.getByRole('table')).toBeVisible();

    const tbody = within(screen.getByRole('table')).queryAllByRole(
      'rowgroup'
    )[1];
    expect(within(tbody).getAllByRole('row')).toHaveLength(5);
  });
});
