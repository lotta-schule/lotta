import * as React from 'react';
import { Usage } from './Usage';
import { loadTenant, loadTenantUsage } from 'loader';

export async function UsagePage() {
  const [tenant, usage] = await Promise.all([loadTenant(), loadTenantUsage()]);

  return <Usage tenant={tenant} usage={usage} />;
}

export default UsagePage;
