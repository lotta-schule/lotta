import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { useServerData } from 'shared/ServerDataContext';
import { graphql, ResultOf } from 'api/graphql';

export const TENANT_COMMON_FIELDS = graphql(`
  fragment TenantCommonFields on Tenant @_unmask {
    id
    slug
    title
    type
    host
    identifier

    eduplacesId

    backgroundImageFile {
      id
      formats(category: "PAGEBG") {
        name
        url
        type
        availability {
          status
        }
      }
    }

    logoImageFile {
      id
      formats(category: "LOGO") {
        name
        url
        type
        availability {
          status
        }
      }
    }

    configuration {
      customTheme
      userMaxStorageConfig
    }
  }
`);

export const GET_TENANT_QUERY = graphql(
  `
    query GetTenant {
      tenant {
        ...TenantCommonFields
      }
    }
  `,
  [TENANT_COMMON_FIELDS]
);

export type Tenant = NonNullable<ResultOf<typeof GET_TENANT_QUERY>['tenant']>;

export const useTenant = () => {
  const { tenant } = useServerData();

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  React.useEffect(() => {
    if (tenant) {
      Sentry.setContext('tenant', tenant);
    }
  }, [tenant]);

  return tenant;
};
