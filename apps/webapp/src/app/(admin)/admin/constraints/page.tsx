import * as React from 'react';
import { loadTenant } from 'loader';
import { ConstraintList } from './ConstraintsList';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { t } from 'i18next';

async function ConstraintsListPage() {
  const tenant = await loadTenant();

  return (
    <AdminPage
      icon={faExpand}
      title={t('constraints')}
      hasHomeLink
      takesFullSpace
    >
      <ConstraintList tenant={tenant} />
    </AdminPage>
  );
}

export default ConstraintsListPage;
