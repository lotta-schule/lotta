import * as React from 'react';
import { loadTenant } from 'loader';
import { ConstraintList } from './ConstraintsList';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'app/admin/_component/AdminPage';

async function ConstraintsListPage() {
  const tenant = await loadTenant();

  return (
    <AdminPage icon={faExpand} title={'Beschränkungen'} hasHomeLink>
      <ConstraintList tenant={tenant} />
    </AdminPage>
  );
}

export default ConstraintsListPage;
