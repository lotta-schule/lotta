import { gql } from '@apollo/client';

export const GetSystemUsageQuery = gql`
    query GetSystemUsage {
        usage {
            periodStart
            periodEnd
            storage {
                usedTotal
                filesTotal
            }
            media {
                mediaFilesTotal
                mediaFilesTotalDuration
                mediaConversionCurrentPeriod
            }
        }
    }
`;
