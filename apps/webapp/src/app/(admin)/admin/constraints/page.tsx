import * as React from 'react';
import { loadTenant } from '#/loader/index.js';
import { ConstraintList } from './ConstraintsList.js';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from '#/app/(admin)/admin/_component/AdminPage.js';
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
