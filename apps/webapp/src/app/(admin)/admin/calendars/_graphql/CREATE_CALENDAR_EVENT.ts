import { graphql } from 'api/graphql';
import { RECURRENCE_FRAGMENT } from './GET_CALENDAR_EVENTS';

export const CREATE_CALENDAR_EVENT = graphql(
  `
    mutation CREATE_CALENDAR_EVENT(
      $calendarId: ID!
      $data: CalendarEventInput!
    ) {
      event: createCalendarEvent(calendarId: $calendarId, data: $data) {
        id
        summary
        description
        start
        end
        isFullDay
        recurrence {
          ...RecurrenceFragment
        }
        calendar {
          id
        }
      }
    }
  `,
  [RECURRENCE_FRAGMENT]
);
