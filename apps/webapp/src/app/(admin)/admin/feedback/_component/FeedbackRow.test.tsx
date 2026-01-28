import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { FeedbackModel } from 'model';
import { FeedbackRow } from './FeedbackRow';
import { SomeUser } from 'test/fixtures';

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

describe('FeedbackRow', () => {
  it('should render the username and the topic if not active', async () => {
    const screen = render(
      <table>
        <tbody>
          <FeedbackRow
            feedback={feedback}
            isActive={false}
            onClick={() => {}}
            onDelete={() => {}}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test-Thema')).toBeVisible();
    expect(screen.getByText('Ernesto Guevara')).toBeVisible();

    // The content should not be visible
    expect(screen.queryByText('Test-Nachricht')).toBeNull();
  });

  it('should render the content as well as forward + answer buttons if active', async () => {
    const screen = render(
      <table>
        <tbody>
          <FeedbackRow
            feedback={feedback}
            isActive={true}
            onClick={() => {}}
            onDelete={() => {}}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test-Thema')).toBeVisible();
    expect(screen.getByText('Ernesto Guevara')).toBeVisible();

    await waitFor(() => {
      expect(screen.queryByText('Test-Nachricht')).toBeVisible();
      expect(
        screen.getAllByRole('button', { name: /beantworten|weiterleiten/i })
      ).toHaveLength(2);
    });
  });

  describe('interaction', () => {
    it('should open the ForwardFeedbackDialog when selecting the forward button', async () => {
      const user = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={() => {}}
              onDelete={() => {}}
            />
          </tbody>
        </table>
      );

      await user.click(screen.getByRole('button', { name: /weiterleiten/ }));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Feedback weiterleiten' })
        ).toBeVisible();
      });
    });

    it('should open the RespondToFeedbackDialog when selecting the forward button', async () => {
      const user = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={() => {}}
              onDelete={() => {}}
            />
          </tbody>
        </table>
      );

      await user.click(screen.getByRole('button', { name: /beantworten/ }));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Nutzerfeedback beantworten' })
        ).toBeVisible();
      });
    });

    it('should call onClick() handler when selected', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={onChange}
              onDelete={() => {}}
            />
          </tbody>
        </table>
      );

      await user.click(screen.getAllByRole('row')[0]);

      expect(onChange).toHaveBeenCalled();
    });

    it('should show the delete feedback dialog when the delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={() => {}}
              onDelete={onDelete}
            />
          </tbody>
        </table>,
        {},
        {
          additionalMocks: [
            {
              request: {
                query: DeleteFeedbackMutation,
                variables: {
                  id: feedback.id,
                },
              },
              result: { data: { feedback: { id: feedback.id } } },
            },
          ],
        }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /löschen/i })).toBeVisible();
      });
      await user.click(screen.getByRole('button', { name: /löschen/ }));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /feedback löschen/i })
        ).toBeVisible();
      });

      await user.click(
        screen.getByRole('button', { name: /endgültig löschen/ })
      );

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalled();
      });
    });
  });
});
