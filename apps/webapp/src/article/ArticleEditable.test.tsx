import * as React from 'react';
import { ArticleModel, ContentModuleType } from 'model';
import { ArticleEditable } from './ArticleEditable';
import { Weihnachtsmarkt } from 'test/fixtures';
import { render, userEvent } from 'test/util';

const articleWithManyModules = {
  ...Weihnachtsmarkt,
  contentModules: [
    ...Weihnachtsmarkt.contentModules,
    {
      id: '10051',
      sortKey: 30,
      type: ContentModuleType.TITLE,
      insertedAt: '2019-06-01T16:00:00.000Z',
      updatedAt: '2020-10-11T04:00:00.000Z',
      content: { title: 'Na, wie war dein erster Tag?' },
      configuration: {},
      files: [],
    },
    {
      id: '10052',
      sortKey: 40,
      type: ContentModuleType.DOWNLOAD,
      insertedAt: '2019-06-01T16:00:00.000Z',
      updatedAt: '2020-10-11T04:00:00.000Z',
      content: {},
      configuration: {},
      files: [],
    },
  ],
};

describe('shared/article/ArticleEditable', () => {
  describe('Move contentmodules by buttons', () => {
    it('should not show the move up button on the first content module', () => {
      const screen = render(
        <ArticleEditable
          article={articleWithManyModules}
          onUpdateArticle={vi.fn()}
        />
      );
      const contentModules = screen.getAllByTestId('ContentModule');
      const upButton = contentModules[0].querySelector(
        'button[aria-label*="oben bewegen"]'
      );
      expect(upButton).toBeNull();
    });
    it('should not show the move down button on the last content module', () => {
      const screen = render(
        <ArticleEditable
          article={articleWithManyModules}
          onUpdateArticle={vi.fn()}
        />
      );
      const contentModules = screen.getAllByTestId('ContentModule');
      const downButton = contentModules[4].querySelector(
        'button[aria-label*="unten bewegen"]'
      );
      expect(downButton).toBeNull();
    });

    it('should move the contentModule up when the button is clicked', async () => {
      const fireEvent = userEvent.setup();
      const onUpdate = vi.fn((newArticle: ArticleModel) => {
        expect(
          newArticle.contentModules.map(({ id, sortKey }) => [id, sortKey])
        ).toEqual([
          ['101101', 0],
          ['101102', 10],
          ['101100', 20],
          ['10051', 30],
          ['10052', 40],
        ]);
      });
      const screen = render(
        <ArticleEditable
          article={articleWithManyModules}
          onUpdateArticle={onUpdate}
        />
      );
      const contentModules = screen.getAllByTestId('ContentModule');
      const upButton = contentModules[2].querySelector(
        'button[aria-label*="oben bewegen"]'
      )!;
      expect(upButton).not.toBeNull();
      await fireEvent.click(upButton);
      expect(onUpdate).toHaveBeenCalled();
    });
    it('should move the contentModule down when the button is clicked', async () => {
      const fireEvent = userEvent.setup();
      const onUpdate = vi.fn((newArticle: ArticleModel) => {
        expect(
          newArticle.contentModules.map(({ id, sortKey }) => [id, sortKey])
        ).toEqual([
          ['101101', 0],
          ['101100', 10],
          ['101102', 20],
          ['10052', 30],
          ['10051', 40],
        ]);
      });
      const screen = render(
        <ArticleEditable
          article={articleWithManyModules}
          onUpdateArticle={onUpdate}
        />
      );
      const contentModules = screen.getAllByTestId('ContentModule');
      const downButton = contentModules[3].querySelector(
        'button[aria-label*="unten bewegen"]'
      )!;
      expect(downButton).not.toBeNull();
      await fireEvent.click(downButton);
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});
