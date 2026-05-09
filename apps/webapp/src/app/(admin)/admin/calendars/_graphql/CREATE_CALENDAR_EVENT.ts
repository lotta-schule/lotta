import { graphql } from '#/api/graphql.js';
import { RECURRENCE_FRAGMENT } from './GET_CALENDAR_EVENTS.js';

export const CREATE_CALENDAR_EVENT = graphql(
  `
    mutation CREATE_CALENDAR_EVENT($data: CalendarEventInput!) {
      event: createCalendarEvent(data: $data) {
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
