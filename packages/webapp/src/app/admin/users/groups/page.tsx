import * as React from 'react';
import { loadUserGroups } from 'loader';
import { GroupList } from './GroupList';

export async function GroupListPage() {
  const groups = await loadUserGroups();

  return <GroupList groups={groups} />;
}

export default GroupListPage;
