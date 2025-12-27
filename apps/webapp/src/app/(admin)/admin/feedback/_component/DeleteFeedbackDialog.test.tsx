import * as React from 'react';
import { render, screen, waitFor, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { FeedbackModel } from 'model';
import { DeleteFeedbackDialog } from './DeleteFeedbackDialog';

import DeleteFeedbackMutation from 'api/mutation/DeleteFeedbackMutation.graphql';

const feedback: FeedbackModel = {
  id: '6543-feed-back-1234',
  topic: 'Test-Thema',
  content: 'Test-Nachricht',
  metadata: '',
  user: SomeUser,
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isForwarded: false,
  isResponded: false,
  isNew: false,
};

const mocks = [
  {
    request: {
      query: DeleteFeedbackMutation,
      variables: {
        id: feedback.id,
      },
    },
    result: { data: { feedback: { id: feedback.id } } },
  },
];

describe('DeleteFeedbackDialog', () => {
  it('should render the dialog', async () => {
    const screen = render(
      <DeleteFeedbackDialog
        isOpen
        feedback={feedback}
        onConfirm={() => {}}
        onRequestClose={() => {}}
      />,
      {},
      { additionalMocks: mocks }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /feedback löschen/i })
      ).toBeVisible();
    });
  });

  it('should call onRequestClose when clicking the "Abort" button', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = vi.fn();
    render(
      <DeleteFeedbackDialog
        isOpen
        feedback={feedback}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />,
      {},
      { additionalMocks: mocks }
    );
    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  describe('send delete request', () => {
    it('delete the category and close the dialog', async () => {
      const fireEvent = userEvent.setup();
      const onConfirm = vi.fn();
      const screen = render(
        <DeleteFeedbackDialog
          isOpen
          feedback={feedback}
          onConfirm={onConfirm}
          onRequestClose={() => {}}
        />,
        {},
        { additionalMocks: mocks }
      );
      await fireEvent.click(
        screen.getByRole('button', { name: /endgültig löschen/ })
      );

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });
});
