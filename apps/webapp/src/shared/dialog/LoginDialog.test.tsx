import * as React from 'react';
import { act, render, waitFor, within } from 'test/util';
import { LoginDialog } from './LoginDialog';
import { SomeUser, tenant } from 'test/fixtures';
import LoginMutation from 'api/mutation/LoginMutation.graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
  {
    request: {
      query: LoginMutation,
      variables: {
        username: 'nutzer@email.de',
        password: 'password',
      },
    },
    result: { data: { login: { accessToken: 'abc' } } },
  },
];

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
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should send a complete login, then show a confirm message', async () => {
      const fireEvent = userEvent.setup();
      const onRequestClose = vi.fn();
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
        {},
        { additionalMocks, currentUser: SomeUser }
      );
      await fireEvent.type(
        screen.getByRole('textbox', { name: /e-mail/i }),
        'nutzer@email.de'
      );
      await fireEvent.type(screen.getByLabelText(/passwort/i), 'password');

      vi.useFakeTimers({ shouldAdvanceTime: true });

      await fireEvent.click(
        screen.getByRole('button', { name: /^anmelden$/i })
      );

      await waitFor(() => {
        expect(
          within(
            screen.getByRole('button', { name: /^anmelden$/i })
          ).getByTestId('SuccessIcon')
        ).toBeVisible();
      });

      await act(() => vi.advanceTimersByTimeAsync(2000));

      await waitFor(() => {
        expect(onRequestClose).toHaveBeenCalled();
      });
    });

    it('should send a complete login, then show the password change dialog if the userAvatar logs in for the first time', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
        {},
        {
          additionalMocks,
          currentUser: {
            ...SomeUser,
            hasChangedDefaultPassword: false,
          },
        }
      );
      await fireEvent.type(
        screen.getByRole('textbox', { name: /e-mail/i }),
        'nutzer@email.de'
      );
      await fireEvent.type(screen.getByLabelText(/passwort/i), 'password');
      await fireEvent.click(
        screen.getByRole('button', { name: /^anmelden$/i })
      );
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /passwort ändern/i })
        ).not.toBeNull();
      });
    });
  });

  describe('third-party-login', () => {
    describe('Eduplaces', () => {
      it('should not show the Eduplaces login button when the tenant has no associated eduplacesId', () => {
        const screen = render(
          <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
          {},
          { additionalMocks }
        );

        expect(screen.queryByRole('button', { name: /eduplaces/i })).toBeNull();
      });

      it('should render the Eduplaces login button when tenant has eduplacesId', () => {
        const screen = render(
          <LoginDialog isOpen={true} onRequestClose={vi.fn()} />,
          {},
          { additionalMocks, tenant: { ...tenant, eduplacesId: '123' } }
        );

        expect(
          screen.getByRole('button', { name: /eduplaces/i })
        ).toBeVisible();
      });
    });
  });
});
