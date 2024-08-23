import { graphql } from 'api/graphql';
import { CALENDAR_FRAGMENT } from './GET_CALENDARS';

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
    mutation updateCalendar($id: String!, $data: CalendarInput!) {
      calendar: updateCalendar(id: $id, data: $data) {
        ...CalendarFragment
      }
    }
  `,
  [CALENDAR_FRAGMENT]
);
