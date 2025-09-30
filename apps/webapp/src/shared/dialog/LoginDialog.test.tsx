import * as React from 'react';
import { render } from 'test/util';
import { LoginDialog } from './LoginDialog';
import { tenant } from 'test/fixtures';
import userEvent from '@testing-library/user-event';

describe('shared/dialog/LoginDialog', () => {
  it('should not show the login dialog when isOpen is not true', () => {
    const screen = render(
      <LoginDialog onRequestClose={() => {}} isOpen={false} />,
      {}
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should close the dialog when clicking on cancel', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = vi.fn();
    const screen = render(
      <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
      {}
    );
    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
    expect(onRequestClose).toHaveBeenCalled();
  });

  describe('fields', () => {
    it('should render a form with action /auth/login', () => {
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {}
      );

      const form = screen.getByRole('dialog').querySelector('form');
      expect(form).toHaveAttribute('action', '/auth/login');
      expect(form).toHaveAttribute('method', 'POST');
    });

    it('should have username and password fields with correct names', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {}
      );

      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
      const passwordInput = screen.getByLabelText(/passwort/i);

      expect(emailInput).toHaveAttribute('name', 'username');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      await fireEvent.type(emailInput, 'test@example.com');
      await fireEvent.type(passwordInput, 'mypassword');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('mypassword');
    });

    it('should have a hidden return_path field', () => {
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {}
      );

      const returnPathInput = screen
        .getByRole('dialog')
        .querySelector('input[name="return_path"]');

      expect(returnPathInput).toBeInTheDocument();
      expect(returnPathInput).toHaveAttribute('type', 'hidden');
    });

    it('should have required fields', () => {
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {}
      );

      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
      const passwordInput = screen.getByLabelText(/passwort/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('third-party-login', () => {
    describe('Eduplaces', () => {
      it('should not show the Eduplaces login button when the tenant has no associated eduplacesId', () => {
        const screen = render(
          <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
          {},
          {}
        );

        expect(screen.queryByRole('button', { name: /eduplaces/i })).toBeNull();
      });

      it('should render the Eduplaces login button when tenant has eduplacesId', () => {
        const screen = render(
          <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
          {},
          { tenant: { ...tenant, eduplacesId: '123' } }
        );

        expect(
          screen.getByRole('button', { name: /eduplaces/i })
        ).toBeVisible();
      });
    });
  });
});
