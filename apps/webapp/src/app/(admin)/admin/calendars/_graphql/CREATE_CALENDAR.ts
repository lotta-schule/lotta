import { graphql } from 'api/graphql';

export const CREATE_CALENDAR = graphql(`
  mutation createCalendar($name: String!, $color: String) {
    calendar: createCalendar(name: $name, defaultColor: $color) {
      id
      name
      defaultColor
    }
  }
`);
