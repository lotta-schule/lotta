import { gql } from '@apollo/client';

export const GetUsageQuery = gql`
    query GetUsage {
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
