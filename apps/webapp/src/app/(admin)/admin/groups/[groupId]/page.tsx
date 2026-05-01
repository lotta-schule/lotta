import * as React from 'react';
import { EditUserGroup } from '../_component/index.js';
import { AdminPageTitle } from '../../_component/AdminPageTitle.js';
import { loadUserGroup } from '#/loader/index.js';
import { notFound } from 'next/navigation';

async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await loadUserGroup(groupId);

  if (!group) {
    return notFound();
  }

  return (
    <div>
      <AdminPageTitle backUrl={'/admin/groups'}>{group.name}</AdminPageTitle>
      <EditUserGroup group={group} />
    </div>
  );
}

export default GroupPage;
