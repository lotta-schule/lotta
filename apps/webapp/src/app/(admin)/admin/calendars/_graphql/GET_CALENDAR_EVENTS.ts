import { graphql } from 'api/graphql';

export const RECURRENCE_FRAGMENT = graphql(`
  fragment RecurrenceFragment on CalendarEventRecurrence @_unmask {
    frequency
    interval
    until
    daysOfWeek
    daysOfMonth
    occurrences
  }
`);

export const GET_CALENDAR_EVENTS = graphql(
  `
    query GET_CALENDAR_EVENTS(
      $calendarId: ID!
      $from: DateTime!
      $latest: DateTime
      $limit: Int
    ) {
      calendarEvents(
        calendarId: $calendarId
        from: $from
        latest: $latest
        limit: $limit
      ) {
        id
        start
        end
        summary
        description
        isFullDay
        calendar {
          id
        }
        recurrence {
          ...RecurrenceFragment
        }
      }
    }
  `,
  [RECURRENCE_FRAGMENT]
);
