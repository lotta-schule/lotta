import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { FeedbackDialog } from './FeedbackDialog';

import CreateFeedbackMutation from 'api/mutation/CreateFeedbackMutation.graphql';

const metadata = [
  `User-Agent: ${navigator.userAgent}`,
  `Platform: ${navigator.platform}`,
  `Screen: ${window.screen.width}x${window.screen.height}`,
  `Window: ${window.innerWidth}x${window.innerHeight}`,
  `DevicePixelRatio: ${window.devicePixelRatio}`,
  `DeviceOrientation: ${window.screen.orientation?.type ?? 'unbekannt'}`,
].join('\n');

describe('FeedbackDialog', () => {
  it('should have open / closed state', async () => {
    const screen = render(
      <FeedbackDialog isOpen={false} onRequestClose={() => {}} />,
      {},
      { currentUser: SomeUser }
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    screen.rerender(<FeedbackDialog isOpen={true} onRequestClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
  });

  it('should have a form with topic, content and metadata and send these information', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <FeedbackDialog isOpen={true} onRequestClose={() => {}} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: CreateFeedbackMutation,
              variables: {
                feedback: {
                  topic: 'Test-Thema',
                  content: 'Test-Nachricht',
                  metadata: metadata,
                },
              },
            },
            result: { data: { feedback: { id: '1' } } },
          },
        ],
      }
    );

    const topicInput = screen.getByPlaceholderText('Thema');
    const contentInput = screen.getByPlaceholderText('Nachricht');
    const metadataInput = screen.getByPlaceholderText('Informationen');

    await waitFor(() => {
      expect(topicInput).toBeVisible();
      expect(contentInput).toBeVisible();
      expect(metadataInput).toBeVisible();
    });

    await fireEvent.type(topicInput, 'Test-Thema');
    await fireEvent.type(contentInput, 'Test-Nachricht');

    await fireEvent.click(screen.getByRole('button', { name: /senden/ }));
  });
});
