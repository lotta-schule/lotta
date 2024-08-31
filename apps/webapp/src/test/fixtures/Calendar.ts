import { ResultOf } from 'gql.tada';
import {
  GET_CALENDARS,
  GET_CALENDAR_EVENTS,
} from 'app/(admin)/admin/calendars/_graphql';
import { addHours, endOfDay, startOfDay, startOfHour } from 'date-fns';

export const createCalendarFixture = (
  overrides: Partial<ResultOf<typeof GET_CALENDARS>['calendars'][number]> = {}
) => {
  const subscriptionUrl = overrides.isPubliclyAvailable
    ? 'https://example.com/calendar/ics'
    : null;
  return Object.assign(
    {
      __typename: 'Calendar',
    },
    {
      id: String(Math.floor(Math.random() * 10000) + 1),
      name: 'Klausuren',
      color: '#ff0000',
      isPubliclyAvailable: false,
      subscriptionUrl,
    },
    overrides
  );
};

export const createEventFixture = (
  calendar: ReturnType<typeof createCalendarFixture>,
  overrides: Partial<
    ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'][number]
  > = {}
) => {
  const start = overrides.isFullDay
    ? startOfDay(new Date())
    : startOfHour(new Date());
  const end = overrides.isFullDay ? endOfDay(start) : addHours(start, 1);
  return Object.assign(
    {
      __typename: 'CalendarEvent',
    },
    {
      id: String(Math.floor(Math.random() * 10000) + 1),
      summary: 'Ereignis',
      description: 'Beschreibung',
      start: start.toISOString(),
      end: end.toISOString(),
      isFullDay: false,
      recurrence: null,
      calendar,
    },
    overrides
  );
};
