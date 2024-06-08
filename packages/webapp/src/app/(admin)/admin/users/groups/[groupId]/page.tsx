import * as React from 'react';
import { EditUserGroup } from '../component';
import { loadUserGroup } from 'loader';
import { notFound } from 'next/navigation';

import { AdminPageTitle } from 'app/(admin)/admin/_component/AdminPageTitle';

async function GroupPage({
  params: { groupId },
}: {
  params: { groupId: string };
}) {
  const group = await loadUserGroup(groupId);

  if (!group) {
    return notFound();
  }

  return (
    <div>
      <AdminPageTitle backUrl={'/admin/users/groups'}>
        {group.name}
      </AdminPageTitle>
      <EditUserGroup group={group} />
    </div>
  );
}

export default GroupPage;
