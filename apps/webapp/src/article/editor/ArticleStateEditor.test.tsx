import * as React from 'react';
import {
  adminGroup,
  SomeUser,
  SomeUserin,
  Weihnachtsmarkt,
} from 'test/fixtures';
import { render, userEvent } from 'test/util';
import { ArticleStateEditor } from './ArticleStateEditor';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('shared/article/ArticleStateEditor', () => {
  describe('when in draft state', () => {
    const article = {
      ...Weihnachtsmarkt,
      users: [SomeUserin],
      readyToPublish: false,
    };

    it('should have the "draft" radio button selected', () => {
      const screen = render(
        <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
        {},
        { currentUser: SomeUserin }
      );
      expect(screen.getByRole('radio', { name: /draft/i })).toBeChecked();
    });

    describe('for author', () => {
      it('should have the "ready to publish" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(screen.getByRole('radio', { name: /submitted/i })).toBeEnabled();
      });

      it('should have the "publish" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(
          screen.getByRole('radio', { name: /published/i })
        ).toBeDisabled();
      });

      it('should call onUpdate with "readyToPublish" set to true when "submitted" option is selected', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = vi.fn();
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={onUpdate} />,
          {},
          { currentUser: SomeUserin }
        );
        await fireEvent.click(
          screen.getByRole('radio', { name: /submitted/i })
        );
        expect(onUpdate).toHaveBeenCalledWith({
          ...article,
          readyToPublish: true,
          published: false,
        });
      });
    });

    describe('for admin', () => {
      it('should have the "ready to publish" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(
          screen.getByRole('radio', { name: /submitted/i })
        ).toBeDisabled();
      });

      it('should have the "publish" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(screen.getByRole('radio', { name: /published/i })).toBeEnabled();
      });

      it('should call onUpdate with "publisehd" set to true when "published" option is selected', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = vi.fn();
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={onUpdate} />,
          {},
          { currentUser: adminUser }
        );
        await fireEvent.click(
          screen.getByRole('radio', { name: /published/i })
        );
        expect(onUpdate).toHaveBeenCalledWith({
          ...article,
          readyToPublish: false,
          published: true,
        });
      });
    });
  });

  describe('when in submitted state', () => {
    const article = {
      ...Weihnachtsmarkt,
      users: [SomeUserin],
      readyToPublish: true,
    };

    it('should have the "submitted" radio button selected', () => {
      const screen = render(
        <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
        {},
        { currentUser: SomeUserin }
      );
      expect(screen.getByRole('radio', { name: /submitted/i })).toBeChecked();
    });

    describe('for author', () => {
      it('should have the "draft" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(screen.getByRole('radio', { name: /draft/i })).toBeEnabled();
      });

      it('should have the "publish" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(
          screen.getByRole('radio', { name: /published/i })
        ).toBeDisabled();
      });

      it('should call onUpdate with "readyToPublish" set to false when "draft" option is selected', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = vi.fn();
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={onUpdate} />,
          {},
          { currentUser: SomeUserin }
        );
        await fireEvent.click(screen.getByRole('radio', { name: /draft/i }));
        expect(onUpdate).toHaveBeenCalledWith({
          ...article,
          readyToPublish: false,
          published: false,
        });
      });
    });

    describe('for admin', () => {
      it('should have the "draft" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(
          screen.getByRole('radio', { name: /submitted/i })
        ).toBeDisabled();
      });

      it('should have the "publish" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(screen.getByRole('radio', { name: /published/i })).toBeEnabled();
      });

      it('should call onUpdate with "published" set to true when "published" option is selected', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = vi.fn();
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={onUpdate} />,
          {},
          { currentUser: adminUser }
        );
        await fireEvent.click(
          screen.getByRole('radio', { name: /published/i })
        );
        expect(onUpdate).toHaveBeenCalledWith({
          ...article,
          readyToPublish: false,
          published: true,
        });
      });
    });
  });

  describe('when in published state', () => {
    const article = {
      ...Weihnachtsmarkt,
      users: [SomeUserin],
      readyToPublish: true,
      published: true,
    };

    it('should have the "published" radio button selected', () => {
      const screen = render(
        <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
        {},
        { currentUser: SomeUserin }
      );
      expect(screen.getByRole('radio', { name: /published/i })).toBeChecked();
    });

    describe('for author', () => {
      it('should have the "draft" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(screen.getByRole('radio', { name: /draft/i })).toBeEnabled();
      });

      it('should have the "submitted" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: SomeUserin }
        );
        expect(
          screen.getByRole('radio', { name: /submitted/i })
        ).toBeDisabled();
      });
    });

    describe('for admin', () => {
      it('should have the "draft" option enabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(screen.getByRole('radio', { name: /draft/i })).toBeEnabled();
      });

      it('should have the "submitted" option disabled', () => {
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={vi.fn()} />,
          {},
          { currentUser: adminUser }
        );
        expect(
          screen.getByRole('radio', { name: /submitted/i })
        ).toBeDisabled();
      });

      it('should call onUpdate with "draft" set to true when "draft" option is selected', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = vi.fn();
        const screen = render(
          <ArticleStateEditor article={article} onUpdate={onUpdate} />,
          {},
          { currentUser: adminUser }
        );
        await fireEvent.click(screen.getByRole('radio', { name: /draft/i }));
        expect(onUpdate).toHaveBeenCalledWith({
          ...article,
          readyToPublish: false,
          published: false,
        });
      });
    });
  });
});
