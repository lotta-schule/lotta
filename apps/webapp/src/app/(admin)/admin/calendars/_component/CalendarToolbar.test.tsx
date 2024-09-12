import { render } from 'test/util';
import { describe, it, expect, vi } from 'vitest';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarContext, CalendarProvider } from './CalendarContext';
import { createCalendarFixture } from 'test/fixtures';
import { ResultOf } from 'api/graphql';
import { GET_CALENDARS } from '../_graphql';
import userEvent from '@testing-library/user-event';

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
];

describe('CalendarToolbar', () => {
  beforeAll(() => {
    vi.useFakeTimers({ now: new Date(2023, 9, 12), shouldAdvanceTime: true });
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  const onNavigateMock = vi.fn();

  const renderComponent = ({ calendars = defaultCalendars } = {}) =>
    render(
      <CalendarProvider activeCalendars={calendars}>
        <CalendarToolbar onNavigate={onNavigateMock} />
      </CalendarProvider>,
      {},
      {
        additionalMocks: createAdditionalMocks({ calendars }),
      }
    );

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
    expect(
      screen.getByRole('dialog', { name: /ereignis erstellen/i })
    ).toBeVisible();
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

    expect(
      screen.getByRole('dialog', { name: /kalender verwalten/i })
    ).toBeVisible();
  });

  it('should toggle a calendar when a calendar is clicked from the menu', async () => {
    const toggleCalendarMock = vi.fn();

    const screen = render(
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
      </CalendarContext.Provider>,
      {},
      {
        additionalMocks: createAdditionalMocks({ calendars: defaultCalendars }),
      }
    );

    const calendarMenuButton = await screen.findByRole('button', {
      name: /kalender/i,
    });
    await userEvent.click(calendarMenuButton);
    const calendar = screen.getByText('Klausuren');
    await userEvent.click(calendar);

    expect(toggleCalendarMock).toHaveBeenCalledWith(defaultCalendars[0].id);
  });
});
