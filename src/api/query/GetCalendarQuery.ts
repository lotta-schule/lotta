import gql from 'graphql-tag';

export const GetCalendarQuery = gql`
    query GetCalendar($url: String!) {
        calendar(url: $url) {
            uid
            description
            summary
            start
            end
        }
    }
`;