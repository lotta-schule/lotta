import * as React from 'react';
import { Usage } from './Usage';
import { loadTenant, loadTenantUsage } from 'loader';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from '../_component/AdminPage';

async function UsagePage() {
  const [tenant, usage] = await Promise.all([loadTenant(), loadTenantUsage()]);

  return (
    <AdminPage icon={faChartBar} title={'Nutzung'} hasHomeLink>
      <Usage tenant={tenant} usage={usage} />
    </AdminPage>
  );
}

export default UsagePage;
