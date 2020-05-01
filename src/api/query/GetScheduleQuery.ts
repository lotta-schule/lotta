import { gql } from '@apollo/client';

export const GetScheduleQuery = gql`
    query GetSchedule($widgetId: ID!, $date: Date) {
        schedule(widgetId: $widgetId, date: $date)
    }
`;