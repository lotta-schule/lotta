import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { CreateLottaFeedback } from './CreateLottaFeedback';

import CreateLottaFeedbackMutation from 'api/mutation/CreateLottaFeedbackMutation.graphql';

describe('CreateLottaFeedback', () => {
  it('should have a form with topic, content and metadata and send these information', async () => {
    window.alert = vi.fn();

    const fireEvent = userEvent.setup();
    const screen = render(
      <CreateLottaFeedback />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: CreateLottaFeedbackMutation,
              variables: {
                subject: 'Test-Thema',
                message: 'Test-Nachricht',
              },
            },
            result: { data: { success: true } },
          },
        ],
      }
    );

    const subjectInput = screen.getByLabelText('Thema');
    const messageInput = screen.getByLabelText('Nachricht');

    await waitFor(() => {
      expect(subjectInput).toBeVisible();
      expect(messageInput).toBeVisible();
    });

    await fireEvent.type(subjectInput, 'Test-Thema');
    await fireEvent.type(messageInput, 'Test-Nachricht');

    await fireEvent.click(screen.getByRole('button', { name: /senden/ }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Feedback wurde gesendet');
    });

    expect(subjectInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });
});
