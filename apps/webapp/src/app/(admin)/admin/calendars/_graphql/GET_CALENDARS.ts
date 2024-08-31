import { graphql } from 'api/graphql';

export const CALENDAR_FRAGMENT = graphql(`
  fragment CalendarFragment on Calendar @_unmask {
    id
    name
    color
    isPubliclyAvailable
    subscriptionUrl
  }
`);

export const GET_CALENDARS = graphql(
  `
    query GET_CALENDARS {
      calendars {
        ...CalendarFragment
      }
    }
  `,
  [CALENDAR_FRAGMENT]
);
