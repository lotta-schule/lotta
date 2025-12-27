import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { RegisterDialog } from './RegisterDialog';

import RegisterMutation from 'api/mutation/RegisterMutation.graphql';

describe('shared/dialog/RegisterDialog', () => {
  it('should close the dialog when clicking on cancel', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const screen = render(
      <RegisterDialog isOpen={true} onRequestClose={onRequestClose} />,
      {}
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(screen.getByRole('dialog')).toBeEnabled();
    });
    await user.click(screen.getByRole('button', { name: /abbrechen/i }));
    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  describe('fields', () => {
    it('should send a complete registration, then show a confirm message', async () => {
      const user = userEvent.setup();
      const onRequestClose = vi.fn();
      const additionalMocks = [
        {
          request: {
            query: RegisterMutation,
            variables: {
              user: {
                email: 'nutzer@email.de',
                name: 'Max Mustermann',
                nickname: 'Los Maxos',
                hideFullName: false,
              },
              groupKey: 'ABCDEF',
            },
          },
          result: { data: { register: true } },
        },
      ];
      const screen = render(
        <RegisterDialog isOpen={true} onRequestClose={onRequestClose} />,
        {},
        { additionalMocks }
      );
      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'nutzer@email.de'
      );
      await user.type(screen.getByRole('textbox', { name: /vorname/i }), 'Max');
      await user.type(
        screen.getByRole('textbox', { name: /nachname/i }),
        'Mustermann'
      );
      await user.type(
        screen.getByRole('textbox', { name: /spitzname/i }),
        'Los Maxos'
      );
      await user.click(
        screen.getByRole('checkbox', { name: /öffentlich verstecken/i })
      );
      await user.type(
        screen.getByRole('textbox', { name: /anmeldeschlüssel/i }),
        'ABCDEF'
      );
      await user.click(screen.getByRole('button', { name: /registrieren/i }));
      await waitFor(() => {
        // expect(screen.queryByRole('form')).toBeNull();
        expect(screen.queryByRole('dialog')).toHaveTextContent(
          /erfolgreich eingerichtet/
        );
      });
    });
  });
});
