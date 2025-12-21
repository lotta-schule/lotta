import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { UpdateEmailDialog } from './UpdateEmailDialog';
import { MockLink } from '@apollo/client/testing';

import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';
import UpdateEmailMutation from 'api/mutation/UpdateEmailMutation.graphql';

describe('shared/layouts/adminLayout/userManagment/UpdateEmailDialog', () => {
  it('should show the shared if isOpen is true', async () => {
    const screen = render(
      <UpdateEmailDialog isOpen onRequestClose={() => {}} />
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeVisible();
    });
  });

  it('should not show the shared if isOpen is false', () => {
    const screen = render(
      <UpdateEmailDialog isOpen={false} onRequestClose={() => {}} />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should have the submit button disabled when open', () => {
    const screen = render(
      <UpdateEmailDialog isOpen onRequestClose={() => {}} />
    );
    expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
  });

  it('should start with a disabled submit button, but should enable the button when emails have been entered', async () => {
    const user = userEvent.setup();
    const screen = render(
      <UpdateEmailDialog isOpen onRequestClose={() => {}} />
    );
    expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
    await user.type(screen.getByLabelText('Neue Email:'), 'abc@def.gh');
    expect(screen.getByRole('button', { name: /ändern/ })).not.toBeDisabled();
  });

  describe('send form', () => {
    it('change the email and then close the dialog', async () => {
      const user = userEvent.setup();
      const mock: MockLink.MockedResponse = {
        request: {
          query: UpdateEmailMutation,
          variables: {
            newEmail: 'ab@cd.ef',
          },
        },
        result: vi.fn(() => {
          return {
            data: { updateEmail: { id: 1, email: 'ab@cd.ef' } },
          };
        }),
      };
      const additionalMocks: MockLink.MockedResponse[] = [
        mock,
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
        <UpdateEmailDialog isOpen onRequestClose={onClose} />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await user.fill(screen.getByLabelText('Neue Email:'), 'ab@cd.ef');
      await user.click(screen.getByRole('button', { name: /ändern/ }));
      await waitFor(() => {
        expect(screen.getByTestId('RequestHisecTokenDialog')).toBeVisible();
      });
      await user.fill(screen.getByLabelText('Passwort:'), 'pw123');
      await user.click(screen.getByRole('button', { name: /senden/i }));

      await waitFor(() => {
        expect(mock.result).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should clear the form and call onAbort when clicking the "Reset" button', async () => {
      const user = userEvent.setup();
      const screen = render(
        <UpdateEmailDialog isOpen onRequestClose={() => {}} />
      );
      expect(screen.getByLabelText('Neue Email:')).toHaveValue('');
      await user.click(screen.getByRole('button', { name: /abbrechen/i }));
    });
  });
});
