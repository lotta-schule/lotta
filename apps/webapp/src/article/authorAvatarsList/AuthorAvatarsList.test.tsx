import * as React from 'react';
import { SomeUser, SomeUserin } from 'test/fixtures';
import { render } from 'test/util';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import userEvent from '@testing-library/user-event';

describe('AuthorAvatarsList', () => {
  const users = [SomeUser, SomeUserin];
  it('should render a list of userAvatar avatars', () => {
    const screen = render(<AuthorAvatarsList users={users} />);
    expect(screen.getAllByRole('img', { name: /profilbild/i })).toHaveLength(2);
  });

  describe('Editing', () => {
    it('should show a delete button when "onUpdate" function is given', async () => {
      const fireEvent = userEvent.setup();
      const fn = vi.fn();
      const screen = render(<AuthorAvatarsList users={users} onUpdate={fn} />);
      expect(
        screen.getByRole('button', { name: /che entfernen/i })
      ).toBeInTheDocument();
      await fireEvent.click(
        screen.getByRole('button', { name: /che entfernen/i })
      );
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
