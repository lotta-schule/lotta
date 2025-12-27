import * as React from 'react';
import { SomeUser, SomeUserin } from 'test/fixtures';
import { render, userEvent, waitFor } from 'test/util';
import { AuthorAvatarsList } from './AuthorAvatarsList';

describe('AuthorAvatarsList', () => {
  const users = [SomeUser, SomeUserin];
  it('should render a list of userAvatar avatars', () => {
    const screen = render(<AuthorAvatarsList users={users} />);
    expect(screen.getAllByRole('img', { name: /profilbild/i })).toHaveLength(2);
  });

  describe('Editing', () => {
    it('should show a delete button when "onUpdate" function is given', async () => {
      const user = userEvent.setup();
      const fn = vi.fn();
      const screen = render(<AuthorAvatarsList users={users} onUpdate={fn} />);
      await user.hover(
        screen.getByRole('img', { name: 'Profilbild von Che' }),
        { force: true }
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /che entfernen/i })
        ).toBeVisible();
      });
      await user.click(screen.getByRole('button', { name: /che entfernen/i }));
      expect(fn).toHaveBeenCalledWith([SomeUserin]);
    });

    it('should show the User Search when "onUpdate" function is given', () => {
      const fn = vi.fn();
      const screen = render(<AuthorAvatarsList users={users} onUpdate={fn} />);
      expect(
        screen.getByRole('combobox', { name: /autor hinzufügen/i })
      ).toBeVisible();
    });
  });
});
