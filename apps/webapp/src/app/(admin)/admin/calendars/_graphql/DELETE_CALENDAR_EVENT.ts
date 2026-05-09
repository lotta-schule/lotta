import { graphql } from '#/api/graphql.js';

export const DELETE_CALENDAR_EVENT = graphql(`
  mutation DELETE_CALENDAR_EVENT($id: ID!) {
    event: deleteCalendarEvent(id: $id) {
      id
    }
  }
`);
