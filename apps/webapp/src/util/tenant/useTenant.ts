import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { TenantModel } from 'model';
import { useQuery } from '@apollo/client';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export const useTenant = (): TenantModel => {
  const { data, error } = useQuery<{ tenant: TenantModel }>(GetTenantQuery);
  if (!data) {
    throw error ?? new Error('Tenant could not be retrieved');
  }
  React.useEffect(() => {
    if (data.tenant) {
      Sentry.setContext('tenant', data.tenant);
    }
  }, [data.tenant]);
  return data.tenant;
};
