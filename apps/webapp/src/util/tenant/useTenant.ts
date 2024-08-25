import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { TenantModel } from 'model';
import { useQuery } from '@apollo/client';
import { useServerData } from 'shared/ServerDataContext';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export const useTenant = (): TenantModel => {
  const { tenant: serverTenant } = useServerData();
  const { data, error } = useQuery<{ tenant: TenantModel }>(GetTenantQuery);

  const tenant = data?.tenant ?? serverTenant;

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
