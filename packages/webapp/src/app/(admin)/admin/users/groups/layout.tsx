import * as React from 'react';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { DraggableGroupList } from './component/DraggableGroupList';
import { GroupListToolbar } from './component/GroupListToolbar';
import clsx from 'clsx';

import styles from './layout.module.scss';

async function GroupsLayout({
  children,
  params,
}: React.PropsWithChildren<{ params: { groupId?: string } }>) {
  console.log({ params });
  return (
    <AdminPage icon={faUserGroup} title={'Gruppen'} hasHomeLink>
      <aside className={clsx({ [styles.hideOnMobile]: !!params.groupId })}>
        <GroupListToolbar />
        <DraggableGroupList />
      </aside>
      {children}
    </AdminPage>
  );
}
export default GroupsLayout;
