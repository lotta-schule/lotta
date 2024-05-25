import * as React from 'react';
import { loadTenant } from 'loader';
import { ConstraintList } from './ConstraintsList';

export async function ConstraintsListPage() {
  const tenant = await loadTenant();

  return <ConstraintList tenant={tenant} />;
}

export default ConstraintsListPage;
