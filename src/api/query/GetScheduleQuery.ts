import gql from 'graphql-tag';

export const GetScheduleQuery = gql`
    query GetSchedule($widgetId: ID!) {
        schedule(widgetId: $widgetId)
    }
`;