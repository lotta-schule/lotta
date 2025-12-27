import React from 'react';
import { MockLink } from '@apollo/client/testing';
import { fireEvent, render, waitFor, userEvent } from 'test/util';
import { GET_CALENDARS, UPDATE_CALENDAR_EVENT } from '../_graphql';
import { EditEventDialog } from './EditEventDialog';
import { createCalendarFixture, createEventFixture } from 'test/fixtures';
import { ResultOf, VariablesOf } from 'api/graphql';

const calendars = [
  createCalendarFixture({ id: '1', name: 'Klausuren' }),
  createCalendarFixture({
    id: '2',
    name: 'Ferien & Feiertage',
    color: '#00ff00',
    isPubliclyAvailable: true,
  }),
  createCalendarFixture({
    id: '3',
    name: 'Schulfeiern',
    color: '#0000ff',
    isPubliclyAvailable: true,
  }),
];
const additionalMocks = [
  {
    request: {
      query: GET_CALENDARS,
    },
    result: {
      data: {
        calendars,
      },
    },
  },
] satisfies MockLink.MockedResponse[];

const eventToBeEdited = createEventFixture(calendars[1]);

describe('EditEventDialog', () => {
  describe('show / hide with eventToBeEdited prop', () => {
    it('should show the dialog when event is passed', async () => {
      const screen = await React.act(() =>
        render(
          <EditEventDialog
            eventToBeEdited={eventToBeEdited}
            onClose={vi.fn()}
          />,
          {},
          { additionalMocks }
        )
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Ereignis bearbeiten' })
        ).toBeVisible();
      });
      expect(await screen.findByLabelText('Name')).toHaveValue(
        eventToBeEdited.summary
      );
      expect(screen.getByLabelText('Beschreibung')).toHaveValue(
        eventToBeEdited.description
      );

      screen.getByRole('button', { name: /Kalender/ });
      expect(
        screen.getByRole('button', { name: /Kalender/ })
      ).toHaveAccessibleName(
        expect.stringMatching(eventToBeEdited.calendar.name)
      );
    });

    it('does not render the dialog when isOpen is false', async () => {
      const screen = render(
        <EditEventDialog eventToBeEdited={null} onClose={vi.fn()} />,
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
        <EditEventDialog
          eventToBeEdited={eventToBeEdited}
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

    it('should update the event data when the form is changed', async () => {
      const user = userEvent.setup();

      const resultFn = vi.fn(() => ({
        data: {
          event: {
            id: eventToBeEdited.id,
            summary: 'Neuer Name',
            description: null,
            start: eventToBeEdited.start,
            end: eventToBeEdited.end,
            isFullDay: false,
            recurrence: null,
            calendar: calendars[2],
          },
        },
      }));

      const mock: MockLink.MockedResponse<
        ResultOf<typeof UPDATE_CALENDAR_EVENT>,
        VariablesOf<typeof UPDATE_CALENDAR_EVENT>
      > = {
        request: {
          query: UPDATE_CALENDAR_EVENT,
          variables: {
            id: eventToBeEdited.id,
            data: {
              summary: 'Neuer Name',
              description: 'Neue Beschreibung',
              start: eventToBeEdited.start,
              end: eventToBeEdited.end,
              isFullDay: false,
              recurrence: null,
              calendarId: calendars[2].id,
            },
          },
        },
        result: resultFn,
      };

      const screen = await React.act(() =>
        render(
          <EditEventDialog
            eventToBeEdited={eventToBeEdited}
            onClose={vi.fn()}
          />,
          {},
          { additionalMocks: [...additionalMocks, mock] }
        )
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });

      const nameInput = await screen.findByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Neuer Name');
      expect(nameInput).toHaveValue('Neuer Name');

      const descriptionInput = await screen.findByLabelText('Beschreibung');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Neue Beschreibung');
      expect(descriptionInput).toHaveValue('Neue Beschreibung');

      const selectElement = await screen.findByRole('combobox', {
        name: 'Kalender',
        hidden: true,
      });
      fireEvent.change(selectElement, {
        target: { value: calendars[2].id },
      });

      expect(
        screen.getByRole('button', { name: 'speichern' })
      ).not.toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'speichern' }));

      await waitFor(() => {
        expect(resultFn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
