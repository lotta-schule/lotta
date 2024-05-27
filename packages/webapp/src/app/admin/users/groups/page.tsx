import * as React from 'react';
import { loadUserGroups } from 'loader';
import { GroupList } from './GroupList';
import { AdminPage } from 'app/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

async function GroupListPage() {
  const groups = await loadUserGroups();

  return (
    <AdminPage icon={faUserGroup} title={'Gruppen'} hasHomeLink>
      <GroupList groups={groups} />
    </AdminPage>
  );
}

export default GroupListPage;
