import { graphql } from 'api/graphql';

export const GET_CALENDARS = graphql(`
  query GET_CALENDARS {
    calendars {
      id
      name
      defaultColor
    }
  }
`);
