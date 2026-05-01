import * as React from 'react';
import { render, waitFor, within, userEvent } from '#/test/util.js';
import { Feedback } from './Feedback.js';
import { feedbacks } from '#/test/fixtures/index.js';
import { DeleteFeedbackDialogProps } from './_component/DeleteFeedbackDialog.js';

describe('Feedback', () => {
  it('should list all feedbacks', async () => {
    const screen = render(<Feedback feedbacks={feedbacks} />);

    const tbody = screen
      .getByRole('table')
      .querySelector('tbody') as HTMLTableSectionElement;
    expect(within(tbody).queryAllByRole('row')).toHaveLength(feedbacks.length);
  });

  it('should set the row active / inactive on click', async () => {
    const user = userEvent.setup();
    const screen = render(<Feedback feedbacks={feedbacks} />);

    const tbody = screen
      .getByRole('table')
      .querySelector('tbody') as HTMLTableSectionElement;
    const firstRow = within(tbody).getAllByRole('row')[0];

    await user.click(firstRow);

    expect(within(tbody).getAllByRole('row')).toHaveLength(
      feedbacks.length + 1
    );

    await user.click(firstRow);

    expect(within(tbody).queryAllByRole('row')).toHaveLength(feedbacks.length);
  });

  it('should set the row inactive when onDelete was called', async () => {
    vi.mock('./_component/DeleteFeedbackDialog.js', async () => {
      const React = await import('react');
      return {
        DeleteFeedbackDialog: ({
          isOpen,
          onConfirm,
        }: DeleteFeedbackDialogProps) => {
          React.useEffect(() => {
            if (isOpen) {
              onConfirm();
            }
          }, [isOpen, onConfirm]);
          return null;
        },
      };
    });

    const user = userEvent.setup();
    const screen = render(<Feedback feedbacks={feedbacks} />);

    const tbody = screen
      .getByRole('table')
      .querySelector('tbody') as HTMLTableSectionElement;
    const firstRow = within(tbody).getAllByRole('row')[0];

    await user.click(firstRow);

    await user.click(
      await within(firstRow).findByRole('button', { name: /löschen/i })
    );

    await waitFor(() => {
      expect(within(tbody).queryAllByRole('row')).toHaveLength(
        feedbacks.length
      );
    });
  });
});
