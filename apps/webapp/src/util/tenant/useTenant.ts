import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { useQuery } from '@apollo/client';
import { graphql, ResultOf } from 'api/graphql';

export const GET_TENANT_QUERY = graphql(`
  query GetTenant {
    tenant {
      id
      title
      slug
      host
      identifier
      backgroundImageFile {
        id
        formats {
          name
          url
          type
          status
        }
      }
      logoImageFile {
        id
        formats {
          name
          url
          type
          status
        }
      }
      configuration {
        customTheme
        userMaxStorageConfig
      }
    }
  }
`);

export type Tenant = NonNullable<ResultOf<typeof GET_TENANT_QUERY>['tenant']>;

export const useTenant = () => {
  const { data, error } = useQuery(GET_TENANT_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const tenant = data?.tenant;

  if (!tenant) {
    throw error ?? new Error('Tenant could not be retrieved');
  }

  React.useEffect(() => {
    if (tenant) {
      Sentry.setContext('tenant', tenant);
    }
  }, [tenant]);

  return tenant;
};
