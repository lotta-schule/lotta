import * as React from 'react';
import { GeneralSettings } from './GeneralSettings';
import { loadTenant } from 'loader';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faSliders } from '@fortawesome/free-solid-svg-icons';

async function GeneralSettingsPage() {
  const tenant = await loadTenant();

  return (
    <AdminPage icon={faSliders} title="Grundeinstellungen" hasHomeLink>
      <GeneralSettings tenant={tenant} />
    </AdminPage>
  );
}

export default GeneralSettingsPage;
