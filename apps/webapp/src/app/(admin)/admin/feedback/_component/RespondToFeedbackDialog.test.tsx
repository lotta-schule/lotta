import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { FeedbackModel } from 'model';
import { RespondToFeedbackDialog } from './RespondToFeedbackDialog';

import RespondToFeedbackMutation from 'api/mutation/RespondToFeedbackMutation.graphql';

const metadata = [
  `User-Agent: ${navigator.userAgent}`,
  `Platform: ${navigator.platform}`,
  `Screen: ${window.screen.width}x${window.screen.height}`,
  `Window: ${window.innerWidth}x${window.innerHeight}`,
  `DevicePixelRatio: ${window.devicePixelRatio}`,
  `DeviceOrientation: ${window.screen.orientation?.type ?? 'unbekannt'}`,
].join('\n');

describe('RespondToFeedbackDialog', () => {
  const feedback: FeedbackModel = {
    id: '6543-feed-back-1234',
    topic: 'Test-Thema',
    content: 'Test-Nachricht',
    metadata: metadata,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isForwarded: false,
    isResponded: false,
    isNew: false,
  };

  it('should have open / closed state', async () => {
    const screen = render(
      <RespondToFeedbackDialog
        feedback={feedback}
        isOpen={false}
        onRequestClose={() => {}}
      />,
      {},
      { currentUser: SomeUser }
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    screen.rerender(
      <RespondToFeedbackDialog
        feedback={feedback}
        isOpen={true}
        onRequestClose={() => {}}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
  });

  it('should have a form with subject and message and send these information', async () => {
    const onRequestClose = vi.fn();

    const fireEvent = userEvent.setup();
    const screen = render(
      <RespondToFeedbackDialog
        feedback={feedback}
        isOpen={true}
        onRequestClose={onRequestClose}
      />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: RespondToFeedbackMutation,
              variables: {
                id: '6543-feed-back-1234',
                subject: 'Kurze Antwort',
                message: 'Lange Antwort Inhalt bla bla',
              },
            },
            result: { data: { feedback: { ...feedback, isResponded: true } } },
          },
        ],
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const subjectInput = screen.getByLabelText('Betreff') as HTMLInputElement;
    const messageInput = screen.getByLabelText('Antwort') as HTMLInputElement;

    await fireEvent.fill(subjectInput, 'Kurze Antwort');
    await fireEvent.type(messageInput, 'Lange Antwort Inhalt bla bla');

    await fireEvent.click(screen.getByRole('button', { name: /senden/ }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });
});
