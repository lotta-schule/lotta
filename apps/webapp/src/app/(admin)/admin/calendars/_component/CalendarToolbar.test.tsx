import * as React from 'react';
import { fireEvent, render, waitFor } from 'test/util';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarContext, CalendarProvider } from './CalendarContext';
import { createCalendarFixture } from 'test/fixtures';
import { ResultOf, VariablesOf } from 'api/graphql';
import {
  CREATE_CALENDAR_EVENT,
  GET_CALENDAR_EVENTS,
  GET_CALENDARS,
} from '../_graphql';
import userEvent from '@testing-library/user-event';
import { MockLink } from '@apollo/client/testing';

const defaultCalendars = [
  createCalendarFixture({ name: 'Klausuren' }),
  createCalendarFixture({ name: 'Ferien' }),
];

const createAdditionalMocks = ({
  calendars,
}: {
  calendars: ResultOf<typeof GET_CALENDARS>['calendars'];
}) => [
  {
    request: {
      query: GET_CALENDARS,
    },
    result: { data: { calendars } },
  },
  {
    request: {
      query: GET_CALENDAR_EVENTS,
    },
    result: { data: { calendarEvents: [] } },
  },
  {
    request: {
      query: CREATE_CALENDAR_EVENT,
      variables: (_vars) => true,
    },
    result: (vars) => {
      return {
        data: {
          event: {
            calendar: { id: vars.data.calendarId },
            id: '0101012309',
            description: vars.data.description || '',
            isFullDay: vars.data.isFullDay,
            recurrence: null,
            summary: vars.data.summary,
            start: vars.data.start,
            end: vars.data.end,
          },
        },
      };
    },
  } satisfies MockLink.MockedResponse<
    ResultOf<typeof CREATE_CALENDAR_EVENT>,
    VariablesOf<typeof CREATE_CALENDAR_EVENT>
  >,
];

describe('CalendarToolbar', () => {
  beforeAll(() => {
    vi.useFakeTimers({ now: new Date(2023, 9, 12), shouldAdvanceTime: true });
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  const onNavigateMock = vi.fn();

  const renderComponent = ({
    calendars = defaultCalendars,
    additionalMocks = [],
  } = {}) => {
    const createContent = () => (
      <CalendarProvider activeCalendars={calendars}>
        <CalendarToolbar onNavigate={onNavigateMock} />
      </CalendarProvider>
    );
    const screen = render(
      createContent(),
      {},
      {
        additionalMocks: [
          ...createAdditionalMocks({ calendars }),
          ...additionalMocks,
        ],
      }
    );

    screen.rerender(createContent());

    return screen;
  };

  it('should render the toolbar buttons correctly', async () => {
    const screen = renderComponent();

    expect(await screen.findByTitle(/vorheriger Monat/i)).toBeInTheDocument();
    expect(screen.getByTitle(/heute/i)).toBeInTheDocument();
    expect(screen.getByTitle(/nächster Monat/i)).toBeInTheDocument();
  });

  it('should call onNavigate when navigation buttons are clicked', async () => {
    const screen = renderComponent();
    const prevButton = await screen.findByTitle(/vorheriger Monat/i);
    const todayButton = screen.getByTitle(/heute/i);
    const nextButton = screen.getByTitle(/nächster Monat/i);

    await userEvent.click(prevButton);
    expect(onNavigateMock).toHaveBeenCalledWith('PREV');

    await userEvent.click(todayButton);
    expect(onNavigateMock).toHaveBeenCalledWith('TODAY');

    await userEvent.click(nextButton);
    expect(onNavigateMock).toHaveBeenCalledWith('NEXT');
  });

  it('should render the correct date label based on currentView and currentDate', async () => {
    const screen = renderComponent();
    const dateLabel = await screen.findByText('Oktober 2023');
    expect(dateLabel).toBeInTheDocument();
  });

  it('should open CreateEventDialog when create event button is clicked', async () => {
    const screen = renderComponent();
    const createEventButton = await screen.findByRole('button', {
      name: /ereignis erstellen/i,
    });

    await userEvent.click(createEventButton);

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ereignis erstellen/i })
      ).toBeVisible();
    });
  });

  it('should navigate to the newly created date when CreateEventDialog has been closed', async () => {
    const screen = renderComponent();
    const user = userEvent.setup();

    const createEventButton = await screen.findByRole('button', {
      name: /ereignis erstellen/i,
    });

    await userEvent.click(createEventButton);
    const dialog = screen.getByRole('dialog', {
      name: /ereignis erstellen/i,
    }) as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    await user.type(await screen.findByLabelText(/name/i), 'New-Test');
    fireEvent.change(await screen.findByLabelText('Datum'), {
      target: { value: '2999-07-19' },
    });

    const button = await screen.findByRole('button', {
      name: /speichern/i,
    });
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(button).toBeDisabled();

    vi.advanceTimersByTime(5000);

    await waitFor(
      () => {
        expect(dialog.open).toBe(false);
      },
      { timeout: 30_000 }
    );

    expect(await screen.findByText('Juli 2999')).toBeVisible();
  });

  it('should disable create event button if no calendars are available', async () => {
    const screen = renderComponent({ calendars: [] });
    const createEventButton = await screen.findByRole('button', {
      name: /ereignis erstellen/i,
    });
    expect(createEventButton).toBeDisabled();
  });

  it('should open ManageCalendarsDialog when Manage Calendars is clicked from the menu', async () => {
    const screen = renderComponent();
    const calendarMenuButton = await screen.findByRole('button', {
      name: /kalender/i,
    });

    await userEvent.click(calendarMenuButton);
    const manageCalendarsOption = screen.getByText(/Kalender verwalten/i);
    await userEvent.click(manageCalendarsOption);

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /kalender verwalten/i })
      ).toBeVisible();
    });

    const dateLabel = await screen.findByText('Oktober 2023');
    expect(dateLabel).toBeVisible();
  });

  it('should toggle a calendar when a calendar is clicked from the menu', async () => {
    const toggleCalendarMock = vi.fn();

    const createContent = () => (
      <CalendarContext.Provider
        value={{
          currentView: 'month',
          currentDate: new Date(2023, 9, 12),
          activeCalendarIds: ['1'],
          editingEvent: null,
          toggleCalendar: toggleCalendarMock,
          setCurrentDate: vi.fn(),
          setCurrentView: vi.fn(),
          isCalendarActive: vi.fn(),
          setEditingEvent: vi.fn(),
        }}
      >
        <CalendarToolbar onNavigate={onNavigateMock} />
      </CalendarContext.Provider>
    );

    const screen = render(
      createContent(),
      {},
      {
        additionalMocks: createAdditionalMocks({ calendars: defaultCalendars }),
      }
    );

    screen.rerender(createContent());

    const calendarMenuButton = await screen.findByRole('button', {
      name: /kalender/i,
    });
    await userEvent.click(calendarMenuButton);
    const calendar = screen.getByText('Klausuren');
    await userEvent.click(calendar);

    expect(toggleCalendarMock).toHaveBeenCalledWith(defaultCalendars[0].id);
  });
});
