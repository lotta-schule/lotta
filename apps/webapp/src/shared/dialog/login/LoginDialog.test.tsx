import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { LoginDialog } from './LoginDialog';
import { tenant } from 'test/fixtures';

describe('shared/dialog/LoginDialog', () => {
  it('should not show the login dialog when isOpen is not true', () => {
    const screen = render(
      <LoginDialog onRequestClose={() => {}} isOpen={false} />,
      {}
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should close the dialog when clicking on cancel', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const screen = render(
      <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
      {}
    );
    await user.click(screen.getByRole('button', { name: /abbrechen/i }));
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
      const user = userEvent.setup();
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {}
      );

      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
      const passwordInput = screen.getByLabelText(/passwort/i);

      expect(emailInput).toHaveAttribute('name', 'username');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.fill(emailInput, 'test@example.com');
      await user.fill(passwordInput, 'mypassword');

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

  describe('email registration disabled', () => {
    it('should not show email/password fields when isEmailRegistrationEnabled is false', () => {
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {},
        {
          tenant: {
            ...tenant,
            eduplacesId: '123',
            configuration: {
              isEmailRegistrationEnabled: false,
            },
          },
        }
      );

      expect(screen.queryByRole('textbox', { name: /e-mail/i })).toBeNull();
      expect(screen.queryByLabelText(/passwort/i)).toBeNull();
      expect(screen.getByRole('button', { name: /eduplaces/i })).toBeVisible();
    });

    it('should show email/password fields when isEmailRegistrationEnabled is true', () => {
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {},
        {
          tenant: {
            ...tenant,
            configuration: {
              isEmailRegistrationEnabled: true,
            },
          },
        }
      );

      expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeVisible();
      expect(screen.getByLabelText(/passwort/i)).toBeVisible();
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

      it('should render the Eduplaces login button when tenant has eduplacesId', async () => {
        const screen = render(
          <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
          {},
          { tenant: { ...tenant, eduplacesId: '123' } }
        );

        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /eduplaces/i })
          ).toBeVisible();
        });
      });
    });
  });
});
