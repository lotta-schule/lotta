import { graphql } from '#/api/graphql.js';
import { RECURRENCE_FRAGMENT } from './GET_CALENDAR_EVENTS.js';

export const UPDATE_CALENDAR_EVENT = graphql(
  `
    mutation UPDATE_CALENDAR_EVENT($id: ID!, $data: CalendarEventInput!) {
      event: updateCalendarEvent(id: $id, data: $data) {
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
