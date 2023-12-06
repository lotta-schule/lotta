import { render, waitFor } from 'test/util';
import { FeedbackModel } from 'model';
import { FeedbackRow } from './FeedbackRow';
import { SomeUser } from 'test/fixtures';
import userEvent from '@testing-library/user-event';

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
          <FeedbackRow feedback={feedback} isActive={true} onClick={() => {}} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test-Thema')).toBeVisible();
    expect(screen.getByText('Ernesto Guevara')).toBeVisible();

    await waitFor(() => {
      expect(screen.queryByText('Test-Nachricht')).toBeVisible();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('interaction', () => {
    it('should open the ForwardFeedbackDialog when selecting the forward button', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={() => {}}
            />
          </tbody>
        </table>
      );

      await fireEvent.click(
        screen.getByRole('button', { name: /weiterleiten/ })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Feedback weiterleiten' })
        ).toBeVisible();
      });
    });

    it('should open the RespondToFeedbackDialog when selecting the forward button', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={() => {}}
            />
          </tbody>
        </table>
      );

      await fireEvent.click(
        screen.getByRole('button', { name: /beantworten/ })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Nutzerfeedback beantworten' })
        ).toBeVisible();
      });
    });

    it('should call onClick() handler when selected', async () => {
      const onChange = jest.fn();
      const fireEvent = userEvent.setup();
      const screen = render(
        <table>
          <tbody>
            <FeedbackRow
              feedback={feedback}
              isActive={true}
              onClick={onChange}
            />
          </tbody>
        </table>
      );

      await fireEvent.click(screen.getAllByRole('row')[0]);

      expect(onChange).toHaveBeenCalled();
    });
  });
});
