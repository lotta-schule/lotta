import { graphql } from 'api/graphql';
import { RECURRENCE_FRAGMENT } from './GET_CALENDAR_EVENTS';

export const CREATE_CALENDAR_EVENT = graphql(
  `
    mutation CREATE_CALENDAR_EVENT(
      $calendarId: ID!
      $name: String!
      $description: String
      $start: DateTime!
      $end: DateTime!
      $isFullDay: Boolean!
      $recurrence: RecurrenceInput
    ) {
      event: createCalendarEvent(
        calendarId: $calendarId
        summary: $name
        description: $description
        start: $start
        end: $end
        isFullDay: $isFullDay
        recurrence: $recurrence
      ) {
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
