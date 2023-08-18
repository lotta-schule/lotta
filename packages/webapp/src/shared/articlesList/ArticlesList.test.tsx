import * as React from 'react';
import { render } from 'test/util';
import {
  ComputerExperten,
  VivaLaRevolucion,
  Schulfest,
  Weihnachtsmarkt,
  Klausurenplan,
  imageFile,
  KunstCategory,
} from 'test/fixtures';
import { ArticlesList } from './ArticlesList';

describe('shared/articlesList/ArticlesList', () => {
  const allArticles = [
    Weihnachtsmarkt,
    Klausurenplan,
    Schulfest,
    VivaLaRevolucion,
    ComputerExperten,
  ];

  it('should render an ArticlesList without error', () => {
    render(<ArticlesList articles={allArticles} />, {});
  });

  it('should sort the articles by date', async () => {
    const screen = render(<ArticlesList articles={allArticles} />, {});
    const links = await screen.findAllByRole('link');
    expect(Array.from(links).map((link) => link.textContent)).toEqual([
      'Weihnachtsmarkt',
      'Klausurenplan',
      'Schulfest',
      'Viva La Revolucion',
      'Computerexperten',
    ]);
  });

  it("should show the article's article", () => {
    const screen = render(
      <ArticlesList
        articles={[{ ...Weihnachtsmarkt, category: KunstCategory }]}
      />,
      {}
    );

    expect(screen.getByRole('cell', { name: /kunst/i })).toBeVisible();
  });

  it("should show the article's preview image if one is available", () => {
    const screen = render(
      <ArticlesList
        articles={[{ ...Weihnachtsmarkt, previewImageFile: imageFile as any }]}
      />,
      {}
    );

    expect(screen.getByRole('img')).toBeVisible();
  });

  describe('should show correct status', () => {
    it('for non-ready, non-published article', () => {
      const screen = render(
        <ArticlesList
          articles={[
            {
              ...Weihnachtsmarkt,
              published: false,
              readyToPublish: false,
            },
          ]}
        />,
        {}
      );
      expect(screen.getByRole('cell', { name: /bearbeitung/i })).toBeVisible();
    });

    it('for ready, non-published article', () => {
      const screen = render(
        <ArticlesList
          articles={[
            {
              ...Weihnachtsmarkt,
              published: false,
              readyToPublish: true,
            },
          ]}
        />,
        {}
      );
      expect(
        screen.getByRole('cell', { name: /bereit zur freigabe/i })
      ).toBeVisible();
    });

    it('for published article', () => {
      const screen = render(
        <ArticlesList
          articles={[
            {
              ...Weihnachtsmarkt,
              published: true,
              readyToPublish: true,
            },
          ]}
        />,
        {}
      );
      expect(
        screen.getByRole('cell', { name: /veröffentlicht/i })
      ).toBeVisible();
    });
  });
});
