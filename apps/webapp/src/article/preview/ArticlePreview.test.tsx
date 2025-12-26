import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import {
  adminGroup,
  imageFile,
  KeinErSieEsUser,
  SomeUser,
  SomeUserin,
  Weihnachtsmarkt,
} from 'test/fixtures';
import { ArticlePreview } from './ArticlePreview';

describe('shared/article/ArticlePreview', () => {
  describe('should render title', () => {
    it('as heading when disableLink prop is set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} disableLink />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByRole('heading', { name: /article title/i })
      ).toBeVisible();
      expect(
        screen.getByRole('heading', { name: /article title/i })
      ).toHaveTextContent('Weihnachtsmarkt');
      expect(
        screen.queryByRole('link', { name: /weihnachtsmarkt/i })
      ).toBeNull();
    });

    it('as link when disableLink prop is not set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByRole('heading', { name: /article title/i })
      ).toBeVisible();
      expect(
        screen.getByRole('heading', { name: /article title/i })
      ).toHaveTextContent('Weihnachtsmarkt');
      expect(
        screen.getByRole('link', { name: /weihnachtsmarkt/i })
      ).toBeVisible();
    });

    it('as editable when onUpdateArticle prop is given', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={vi.fn()} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByRole('textbox', { name: /article title/i })
      ).toBeVisible();
      expect(
        screen.getByRole('textbox', { name: /article title/i })
      ).toHaveValue('Weihnachtsmarkt');
    });

    it('and call update callback when edited', async () => {
      const user = userEvent.setup();
      const fn = vi.fn();
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={fn} />,
        {},
        { currentUser: SomeUser }
      );
      const titleInput = screen.getByRole('textbox', {
        name: /article title/i,
      }) as HTMLInputElement;
      await user.fill(titleInput, 'A');
      expect(fn).toHaveBeenCalledWith({ ...Weihnachtsmarkt, title: 'A' });
    });
  });

  describe('Article Preview field', () => {
    it('should render preview', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByText(
          'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
        )
      ).toBeVisible();
    });

    it('as editable when onUpdateArticle prop is given', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={vi.fn()} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByRole('textbox', { name: /article preview text/i })
      ).toBeVisible();
      expect(
        screen.getByRole('textbox', { name: /article preview text/i })
      ).toHaveValue(
        'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
      );
    });

    it('and call update callback when edited', async () => {
      const user = userEvent.setup();
      const fn = vi.fn();
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={fn} />,
        {},
        { currentUser: SomeUser }
      );
      const previewInput = screen.getByRole('textbox', {
        name: /article preview text/i,
      }) as HTMLInputElement;
      await user.fill(previewInput, 'A');
      expect(fn).toHaveBeenCalledWith({
        ...Weihnachtsmarkt,
        preview: 'A',
      });
    });
  });

  describe('preview image', () => {
    it('should not render if not available when not in EditMode', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.queryByRole('img', { name: /vorschaubild/i })).toBeNull();
    });

    it('should render if available', () => {
      const screen = render(
        <ArticlePreview
          article={{
            ...Weihnachtsmarkt,
            previewImageFile: imageFile,
          }}
        />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.getByRole('img', { name: /vorschaubild/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: /vorschaubild/i })
      ).toHaveAttribute(
        'srcset',
        expect.stringContaining('/articlepreview_660')
      );
    });

    describe('EditMode', () => {
      it('as editable when onUpdateArticle prop is given', () => {
        const screen = render(
          <ArticlePreview
            article={Weihnachtsmarkt}
            onUpdateArticle={vi.fn()}
          />,
          {},
          { currentUser: SomeUser }
        );
        expect(screen.getByTestId('EditOverlay')).toBeVisible();
      });
    });
  });

  describe('tags', () => {
    it('should render tags', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.getByTestId('Tag')).toHaveTextContent('La Revolucion');
    });

    it('should not show DeleteButton when in EditMode', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      const tag = screen.getByTestId('Tag');
      expect(tag.querySelector('[data-testid="DeleteButton"]')).toBeNull();
    });

    it('should show DeleteButton when in EditMode', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={vi.fn()} />,
        {},
        { currentUser: SomeUser }
      );
      const tag = screen.getByTestId('Tag');
      expect(tag.querySelector('svg')).toBeVisible();
    });

    it('should delete the tag when DeleteButton is clicked', async () => {
      const fireEvent = userEvent.setup();
      const fn = vi.fn();
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={fn} />,
        {},
        { currentUser: SomeUser }
      );
      const tag = screen.getByTestId('Tag');
      await fireEvent.click(tag.querySelector('svg')!);
      expect(fn).toHaveBeenCalledWith({
        ...Weihnachtsmarkt,
        tags: [],
      });
    });

    it('should add a new tag', async () => {
      const fireEvent = userEvent.setup();
      const fn = vi.fn();
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} onUpdateArticle={fn} />,
        {},
        { currentUser: SomeUser }
      );
      await fireEvent.type(
        screen.getByRole('combobox', { name: /tag hinzufügen/i }),
        'Neu{Enter}'
      );
      await waitFor(() => {
        expect(fn).toHaveBeenCalledWith({
          ...Weihnachtsmarkt,
          tags: ['La Revolucion', 'Neu'],
        });
      });
    });
  });

  describe('UpdateTime', () => {
    it('should render last update time', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.getByText('11.10.2020')).toBeVisible();
    });

    it('should render a "hasUpdate" dot when article has been updated', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.queryByTestId('updated-dot')).toBeNull();
      const updatedArticle = {
        ...Weihnachtsmarkt,
        updatedAt: new Date(
          new Date(SomeUser.updatedAt).getTime() + 1000
        ).toISOString(),
      };
      screen.rerender(<ArticlePreview article={updatedArticle} />);
      expect(screen.getByTestId('updated-dot')).toBeVisible();
    });
  });

  describe('Users List', () => {
    const WeihnachtsmarktWithUsers = {
      ...Weihnachtsmarkt,
      users: [SomeUser, SomeUserin],
    };
    it('should render the users list', () => {
      const screen = render(
        <ArticlePreview article={WeihnachtsmarktWithUsers} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.getByTestId('AuthorAvatarsList')).toBeVisible();
      expect(screen.getAllByRole('img', { name: /profilbild/i })).toHaveLength(
        2
      );
    });

    describe('EditMode', () => {
      it('should show the "add author" input field when in EditMode', () => {
        const screen = render(
          <ArticlePreview
            article={WeihnachtsmarktWithUsers}
            onUpdateArticle={vi.fn()}
          />,
          {},
          { currentUser: SomeUser }
        );
        expect(
          screen.getByRole('combobox', { name: /autor hinzufügen/i })
        ).toBeVisible();
      });

      it('should show the "delete" button for authors when in EditMode', async () => {
        const user = userEvent.setup();
        const fn = vi.fn();
        const screen = render(
          <ArticlePreview
            article={WeihnachtsmarktWithUsers}
            onUpdateArticle={fn}
          />,
          {},
          { currentUser: KeinErSieEsUser }
        );
        await user.hover(
          screen.getByRole('img', { name: 'Profilbild von Che' }),
          { force: true }
        );
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /che entfernen/i })
          ).toBeVisible();
        });
        await user.click(
          screen.getByRole('button', { name: /che entfernen/i })
        );
        await waitFor(() => {
          expect(fn).toHaveBeenCalledWith({
            ...WeihnachtsmarktWithUsers,
            users: [SomeUserin],
          });
        });
      });
      describe('should show warning when removing oneself', () => {
        it('show a warning when userAvatar tries to remove itself', async () => {
          const user = userEvent.setup();
          const onUpdate = vi.fn();
          const screen = render(
            <ArticlePreview
              article={WeihnachtsmarktWithUsers}
              onUpdateArticle={onUpdate}
            />,
            {},
            { currentUser: SomeUser }
          );
          await user.hover(
            screen.getByRole('img', { name: 'Profilbild von Che' }),
            { force: true }
          );
          await user.click(
            screen.getByRole('button', { name: /che entfernen/i })
          );
          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeVisible();
          });
          expect(
            screen.getByRole('dialog').querySelectorAll('button')
          ).toHaveLength(2);
          expect(
            screen.getByRole('dialog').querySelectorAll('button')[0]
          ).toHaveTextContent(/abbrechen/i);
          await user.click(
            screen.getByRole('dialog').querySelectorAll('button')[0]
          );
          await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
          });
        });

        it('show a warning when userAvatar tries to remove him/herself and remove userAvatar on confirm', async () => {
          const user = userEvent.setup();
          const onUpdate = vi.fn();
          const screen = render(
            <ArticlePreview
              article={WeihnachtsmarktWithUsers}
              onUpdateArticle={onUpdate}
            />,
            {},
            { currentUser: SomeUser }
          );
          await user.hover(
            screen.getByRole('img', { name: 'Profilbild von Che' }),
            { force: true }
          );
          await user.click(
            screen.getByRole('button', { name: /che entfernen/i })
          );
          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeVisible();
          });
          expect(
            screen.getByRole('dialog').querySelectorAll('button')
          ).toHaveLength(2);
          expect(
            screen.getByRole('dialog').querySelectorAll('button')[1]
          ).toHaveTextContent(/entfernen/i);
          await user.click(
            screen.getByRole('dialog').querySelectorAll('button')[1]
          );

          expect(onUpdate).toHaveBeenCalledWith({
            ...WeihnachtsmarktWithUsers,
            users: [SomeUserin],
          });
        });
      });
    });
  });

  describe('Edit Button', () => {
    const admin = { ...SomeUser, groups: [adminGroup] };

    it('should be shown for admin', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: admin }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeVisible();
    });

    it('should not be shown for admin if disableEdit is set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} disableEdit />,
        {},
        { currentUser: admin }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeNull();
    });

    it('should be shown for author', () => {
      const screen = render(
        <ArticlePreview article={{ ...Weihnachtsmarkt, users: [SomeUser] }} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeVisible();
    });

    it('should not be shown for author if disableEdit is set', () => {
      const screen = render(
        <ArticlePreview
          article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
          disableEdit
        />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeNull();
    });

    it('should not be shown for other userAvatar', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeNull();
    });

    it('should not be shown for other userAvatar if disableEdit is set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} disableEdit />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag bearbeiten/i })
      ).toBeNull();
    });
  });

  describe('Pin Button', () => {
    const admin = { ...SomeUser, groups: [adminGroup] };

    it('should be shown for admin', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: admin }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeVisible();
    });

    it('should not be shown for admin if disablePin is set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} disablePin />,
        {},
        { currentUser: admin }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeNull();
    });

    it('should not be shown for author', () => {
      const screen = render(
        <ArticlePreview article={{ ...Weihnachtsmarkt, users: [SomeUser] }} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeNull();
    });

    it('should not be shown for author if disablePin is set', () => {
      const screen = render(
        <ArticlePreview
          article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
          disablePin
        />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeNull();
    });

    it('should not be shown for other userAvatar', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeNull();
    });

    it('should not be shown for other userAvatar if disablePin is set', () => {
      const screen = render(
        <ArticlePreview article={Weihnachtsmarkt} disablePin />,
        {},
        { currentUser: SomeUser }
      );
      expect(
        screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
      ).toBeNull();
    });
  });
});
