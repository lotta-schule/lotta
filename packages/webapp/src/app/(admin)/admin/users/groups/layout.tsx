import * as React from 'react';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { DraggableGroupList } from './component/DraggableGroupList';
import { GroupListToolbar } from './component/GroupListToolbar';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function GroupsLayout({
  children,
  params,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  console.log(Array.from(headers().entries()));
  console.log({ params });
  return (
    <AdminPage icon={faUserGroup} title={'Gruppen'} hasHomeLink>
      <aside>
        <GroupListToolbar />
        <DraggableGroupList />
      </aside>
      {children}
    </AdminPage>
  );
}
export default GroupsLayout;
