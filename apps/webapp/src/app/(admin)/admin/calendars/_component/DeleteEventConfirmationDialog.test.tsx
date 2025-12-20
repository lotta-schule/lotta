import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MockLink } from '@apollo/client/testing';
import { DeleteEventConfirmationDialog } from './DeleteEventConfirmationDialog';
import { DELETE_CALENDAR_EVENT } from '../_graphql';
import { vi } from 'vitest';
import { createCalendarFixture, createEventFixture } from 'test/fixtures';
import { ResultOf, VariablesOf } from 'gql.tada';
import userEvent from '@testing-library/user-event';

describe('DeleteEventConfirmationDialog', () => {
  const eventToBeDeleted = createEventFixture(createCalendarFixture());

  const deleteEventMock: MockLink.MockedResponse<
    ResultOf<typeof DELETE_CALENDAR_EVENT>,
    VariablesOf<typeof DELETE_CALENDAR_EVENT>
  > = {
    request: {
      query: DELETE_CALENDAR_EVENT,
      variables: { id: eventToBeDeleted.id },
    },
    result: vi.fn(() => ({
      data: {
        event: {
          id: eventToBeDeleted.id,
        },
      },
    })),
  };
  const additionalMocks = [deleteEventMock];

  describe('show / hide with eventToBeEdited prop', () => {
    it('should show the dialog when event is passed', async () => {
      const screen = render(
        <DeleteEventConfirmationDialog
          eventToDelete={eventToBeDeleted}
          onClose={vi.fn()}
        />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Ereignis löschen' })
        ).toBeVisible();
      });
      expect(screen.getByText(eventToBeDeleted.summary)).toBeVisible();
      expect(screen.getByText(eventToBeDeleted.description)).toBeVisible();
    });

    it('does not render the dialog when isOpen is false', async () => {
      const screen = render(
        <DeleteEventConfirmationDialog
          eventToDelete={null}
          onClose={vi.fn()}
        />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(
          screen.container.querySelector<'dialog'>('dialog')
        ).not.toBeNull();
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const screen = render(
        <DeleteEventConfirmationDialog
          eventToDelete={eventToBeDeleted}
          onClose={handleClose}
        />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });
      await user.click(screen.getByText('abbrechen'));

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should delete event when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const screen = render(
      <DeleteEventConfirmationDialog
        eventToDelete={eventToBeDeleted}
        onClose={onClose}
      />,
      {},
      { additionalMocks: [deleteEventMock] }
    );

    await user.click(screen.getByText('Ereignis endgültig löschen'));

    await waitFor(() => {
      expect(additionalMocks[0].result).toHaveBeenCalled();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
