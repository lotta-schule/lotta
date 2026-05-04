import { graphql } from '#/api/graphql.js';
import { CALENDAR_FRAGMENT } from './GET_CALENDARS.js';

export const CREATE_CALENDAR = graphql(
  `
    mutation createCalendar($data: CalendarInput!) {
      calendar: createCalendar(data: $data) {
        ...CalendarFragment
      }
    }
  `,
  [CALENDAR_FRAGMENT]
);

export const UPDATE_CALENDAR = graphql(
  `
    mutation updateCalendar($id: ID!, $data: CalendarInput!) {
      calendar: updateCalendar(id: $id, data: $data) {
        ...CalendarFragment
      }
    }
  `,
  [CALENDAR_FRAGMENT]
);
