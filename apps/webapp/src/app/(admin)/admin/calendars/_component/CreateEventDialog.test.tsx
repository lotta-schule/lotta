import React from 'react';
import { MockLink } from '@apollo/client/testing';
import { render, fireEvent, waitFor, userEvent } from 'test/util';
import { CreateEventDialog } from './CreateEventDialog';
import { GET_CALENDARS } from '../_graphql';
import { createCalendarFixture } from 'test/fixtures';

const additionalMocks = [
  {
    request: {
      query: GET_CALENDARS,
    },
    result: {
      data: {
        calendars: [
          createCalendarFixture({ id: '1', name: 'Klausuren' }),
          createCalendarFixture({
            id: '2',
            name: 'Ferien & Feiertage',
          }),
          createCalendarFixture(),
        ],
      },
    },
  },
] satisfies MockLink.MockedResponse[];

describe('CreateEventDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date(2024, 7, 16, 12, 27, 48),
      shouldAdvanceTime: true,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the dialog when isOpen is true', async () => {
    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
        {},
        { additionalMocks }
      )
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Ereignis erstellen' })
      ).toBeVisible();
    });
    expect(screen.getByLabelText('Name')).toBeVisible();
    expect(screen.getByLabelText('Beschreibung')).toBeVisible();
    expect(screen.getByRole('button', { name: /Kalender/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Wiederholung/ })).toBeVisible();
  });

  it('does not render the dialog when isOpen is false', async () => {
    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={false} onClose={vi.fn()} />,
        {},
        { additionalMocks }
      )
    );

    await waitFor(() => {
      expect(screen.container.querySelector<'dialog'>('dialog')).not.toBeNull();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={true} onClose={handleClose} />,
        {},
        { additionalMocks }
      )
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
    await user.click(screen.getByText('abbrechen'));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have a disabled "save" button when no name is entered', async () => {
    const user = userEvent.setup();

    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
        {},
        { additionalMocks }
      )
    );

    const saveButton = await screen.findByRole('button', { name: 'speichern' });
    expect(saveButton).toBeDisabled();

    await user.type(await screen.findByLabelText('Name'), 'Test Event');
    expect(saveButton).not.toBeDisabled();
  });

  it('changes the calendar selection', async () => {
    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
        {},
        { additionalMocks }
      )
    );

    const selectElement = await screen.findByRole('combobox', {
      name: 'Kalender',
      hidden: true,
    });
    fireEvent.change(selectElement, { target: { value: '2' } });

    expect(selectElement).toHaveValue('2');
  });

  it('handles all-day checkbox', async () => {
    const user = userEvent.setup();
    const screen = await React.act(() =>
      render(
        <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
        {},
        { additionalMocks }
      )
    );

    const allDayCheckbox = await screen.findByLabelText('ganztägig');

    expect(allDayCheckbox).toBeChecked();

    await React.act(() => user.click(allDayCheckbox));

    expect(allDayCheckbox).not.toBeChecked();
  });

  describe('date change', () => {
    it('changes start date', async () => {
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      const allDayCheckbox = await screen.findByLabelText('ganztägig');
      const multidayCheckbox = await screen.findByLabelText('mehrtägig');

      expect(allDayCheckbox).toBeChecked();
      expect(multidayCheckbox).not.toBeChecked();

      const dateInput = await screen.findByLabelText('Datum');
      fireEvent.change(dateInput, { target: { value: '2024-08-17' } });

      expect(allDayCheckbox).toBeChecked();
      expect(multidayCheckbox).not.toBeChecked();

      expect(dateInput).toHaveValue('2024-08-17');
    });

    it('changes end date', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));
      await user.click(await screen.findByLabelText('mehrtägig'));

      const dateInput = await screen.findByLabelText('Enddatum');
      await React.act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-08-17' } });
      });

      expect(dateInput).toHaveValue('2024-08-17');
    });

    it('changes start date to one day before end date when end date is changed to BEFORE start date', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));
      await user.click(await screen.findByLabelText('mehrtägig'));

      const dateInput = await screen.findByLabelText('Enddatum');
      await React.act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-08-15' } });
      });
      await React.act(async () => {
        fireEvent.blur(dateInput);
      });
      expect(dateInput).toHaveValue('2024-08-15');

      expect(screen.getByLabelText('Datum')).toHaveValue('2024-08-14');
    });

    it('changes end date to one day after start date when start date is changed to AFTER end date', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await waitFor(() => {
        expect(screen.queryByText(/Suspense/)).toBeNull();
      });

      await user.click(await screen.findByLabelText('ganztägig'));
      await user.click(await screen.findByLabelText('mehrtägig'));

      const startDateInput = await screen.findByLabelText('Datum');
      const endDateInput = await screen.findByLabelText('Enddatum');
      await React.act(async () => {
        fireEvent.change(endDateInput, { target: { value: '2024-08-20' } });
      });
      expect(endDateInput).toHaveValue('2024-08-20');
      await React.act(async () => {
        fireEvent.change(startDateInput, { target: { value: '2024-08-21' } });
      });
      await React.act(async () => {
        fireEvent.blur(startDateInput);
      });

      expect(startDateInput).toHaveValue('2024-08-21');

      expect(endDateInput).toHaveValue('2024-08-22');
    });
  });

  describe('time change', () => {
    it('changes start time', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));

      const timeInput = await screen.findByLabelText('Startzeit');
      expect(timeInput).toHaveValue('12:00');
      await user.type(timeInput, '18:30');

      await waitFor(() => {
        expect(timeInput).toHaveValue('18:30');
      });
    });

    it('changes end time', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));

      const endTimeInput = await screen.findByLabelText('Endzeit');
      expect(endTimeInput).toHaveValue('13:00');
      await user.type(endTimeInput, '20:00');

      await waitFor(() => {
        expect(endTimeInput).toHaveValue('20:00');
      });
    });

    it('changes start time to one hour before end time when end time is changed to BEFORE start time', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));

      const startTimeInput = await screen.findByLabelText('Startzeit');
      const endTimeInput = await screen.findByLabelText('Endzeit');
      expect(startTimeInput).toHaveValue('12:00');
      expect(endTimeInput).toHaveValue('13:00');
      await user.type(endTimeInput, '10:00{Escape}');
      expect(endTimeInput).toHaveValue('10:00');

      await waitFor(() => {
        expect(startTimeInput).toHaveValue('09:00');
      });
    });

    it('changes end time to one hour after start time when start time is changed to AFTER end time', async () => {
      const user = userEvent.setup();
      const screen = await React.act(() =>
        render(
          <CreateEventDialog isOpen={true} onClose={vi.fn()} />,
          {},
          { additionalMocks }
        )
      );

      await user.click(await screen.findByLabelText('ganztägig'));

      const startTimeInput = await screen.findByLabelText('Startzeit');
      const endTimeInput = await screen.findByLabelText('Endzeit');
      expect(startTimeInput).toHaveValue('12:00');
      expect(endTimeInput).toHaveValue('13:00');
      await user.type(startTimeInput, '15:00{Escape}');
      expect(startTimeInput).toHaveValue('15:00');

      expect(endTimeInput).toHaveValue('16:00');
    });
  });
});
