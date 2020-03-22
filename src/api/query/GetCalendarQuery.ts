import gql from 'graphql-tag';

export const GetCalendarQuery = gql`
    query GetCalendar($url: String!, $days: Int) {
        calendar(url: $url, days: $days) {
            uid
            description
            summary
            start
            end
        }
    }
`;