import { gql } from '@apollo/client';

export const GetTenantUsageQuery = gql`
    query GetTenantUsage {
        usage {
            periodStart,
            periodEnd,
            storage {
                usedTotal,
                filesTotal
            },
            media {
                mediaFilesTotal,
                mediaFilesTotalDuration,
                mediaConversionCurrentPeriod
            }
        }
    }
`;
