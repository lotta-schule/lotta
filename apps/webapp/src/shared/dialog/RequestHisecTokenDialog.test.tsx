import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';

import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';

describe('shared/dialog/RequestHisecToken', () => {
  describe('show/hide', () => {
    it('should show the shared if isOpen is true', async () => {
      const screen = render(
        <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
        {},
        { currentUser: SomeUser }
      );
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeVisible();
      });
    });

    it('should not show the shared if isOpen is false', () => {
      const screen = render(
        <RequestHisecTokenDialog isOpen={false} onRequestClose={() => {}} />,
        {},
        { currentUser: SomeUser }
      );
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should reset the password field when opening the dialog again', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <RequestHisecTokenDialog isOpen={true} onRequestClose={() => {}} />,
        {},
        { currentUser: SomeUser }
      );

      await fireEvent.type(screen.getByLabelText('Passwort:'), 'test');

      screen.rerender(
        <RequestHisecTokenDialog isOpen={false} onRequestClose={() => {}} />
      );
      screen.rerender(
        <RequestHisecTokenDialog isOpen={true} onRequestClose={() => {}} />
      );
      expect(screen.getByLabelText('Passwort:')).toHaveValue('');
    });
  });

  it('should have the submit button disabled when open', async () => {
    const screen = render(
      <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
      {},
      { currentUser: SomeUser }
    );
    expect(screen.queryByRole('button', { name: /senden/i })).toBeDisabled();
  });

  it('should have the autocomplete props on the inputs', () => {
    const screen = render(
      <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
      {},
      { currentUser: SomeUser }
    );
    expect(screen.getByLabelText('Passwort:')).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  it('button should be enabled when a password is entered', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
      {},
      { currentUser: SomeUser }
    );
    expect(screen.getByRole('button', { name: /senden/ })).toBeDisabled();
    await fireEvent.type(screen.getByLabelText('Passwort:'), 'pw123');
    expect(screen.getByRole('button', { name: /senden/ })).not.toBeDisabled();
  });

  describe('send form', () => {
    it('should close the dialog returning the token', async () => {
      const fireEvent = userEvent.setup();
      const additionalMocks = [
        {
          request: {
            query: RequestHisecTokenMutation,
            variables: {
              password: 'pw123',
            },
          },
          result: { data: { token: 'abc' } },
        },
      ];
      const onClose = vi.fn();
      const screen = render(
        <RequestHisecTokenDialog isOpen onRequestClose={onClose} />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await fireEvent.type(screen.getByLabelText('Passwort:'), 'pw123');
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /senden/ })
        ).not.toBeDisabled();
      });
      await fireEvent.click(screen.getByRole('button', { name: /senden/ }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('abc');
      });
    });

    it('should send the form automatically and return the token when the pw is given', async () => {
      const additionalMocks = [
        {
          request: {
            query: RequestHisecTokenMutation,
            variables: {
              password: 'pw123',
            },
          },
          result: { data: { token: 'abc' } },
        },
      ];
      const onClose = vi.fn();
      render(
        <RequestHisecTokenDialog
          isOpen
          withCurrentPassword={'pw123'}
          onRequestClose={onClose}
        />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('abc');
      });
    });

    it('should clear the form and call onAbort when clicking the "Abort" button', async () => {
      const fireEvent = userEvent.setup();
      const onClose = vi.fn();
      const screen = render(
        <RequestHisecTokenDialog isOpen onRequestClose={onClose} />,
        {},
        { currentUser: SomeUser }
      );
      await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
      expect(onClose).toHaveBeenCalledWith(null);
    });
  });
});
