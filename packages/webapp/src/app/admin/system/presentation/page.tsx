import * as React from 'react';
import { Presentation } from './Presentation';
import { loadTenant } from 'loader';
import { getBaseUrl } from 'helper';

async function PresentationPage() {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  return <Presentation tenant={tenant} baseUrl={baseUrl} />;
}

export default PresentationPage;
