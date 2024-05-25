import * as React from 'react';
import { GeneralSettings } from './GeneralSettings';
import { loadTenant } from 'loader';
import { getBaseUrl } from 'helper';

async function GeneralSettingsPage() {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  return <GeneralSettings tenant={tenant} baseUrl={baseUrl} />;
}

export default GeneralSettingsPage;
