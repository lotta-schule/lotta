import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { FeedbackModel } from 'model';
import { ForwardFeedbackDialog } from './ForwardFeedbackDialog';

import SendFeedbackToLottaMutation from 'api/mutation/SendFeedbackToLottaMutation.graphql';

const metadata = [
  `User-Agent: ${navigator.userAgent}`,
  `Platform: ${navigator.platform}`,
  `Screen: ${window.screen.width}x${window.screen.height}`,
  `Window: ${window.innerWidth}x${window.innerHeight}`,
  `DevicePixelRatio: ${window.devicePixelRatio}`,
  `DeviceOrientation: ${window.screen.orientation?.type ?? 'unbekannt'}`,
].join('\n');

describe('ForwardFeedbackDialog', () => {
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
      <ForwardFeedbackDialog
        feedback={feedback}
        isOpen={false}
        onRequestClose={() => {}}
      />,
      {},
      { currentUser: SomeUser }
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    screen.rerender(
      <ForwardFeedbackDialog
        feedback={feedback}
        isOpen={true}
        onRequestClose={() => {}}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
  });

  it('should show the feedback content', async () => {
    const screen = render(
      <ForwardFeedbackDialog
        isOpen
        feedback={feedback}
        onRequestClose={() => {}}
      />,
      {},
      { currentUser: SomeUser }
    );

    await waitFor(() => {
      expect(screen.getByText('Test-Nachricht')).toBeVisible();
    });
  });

  it('should have a form with message and send these information', async () => {
    const onRequestClose = vi.fn();

    const fireEvent = userEvent.setup();
    const screen = render(
      <ForwardFeedbackDialog
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
              query: SendFeedbackToLottaMutation,
              variables: {
                id: '6543-feed-back-1234',
                message: 'Mein Kommentar: Kein Kommentar',
              },
            },
            result: { data: { feedback: { ...feedback, isForwarded: true } } },
          },
        ],
      }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const messageInput = screen.getByLabelText(
      'Beigefügte Nachricht vom Administrator'
    );

    await fireEvent.type(messageInput, 'Mein Kommentar: Kein Kommentar');

    await fireEvent.click(screen.getByRole('button', { name: /weiterleiten/ }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });
});
