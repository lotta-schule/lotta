import * as React from 'react';
import { loadCurrentUser, loadTenant } from '#/loader/index.js';
import { UserList } from './UserList.js';
import { AdminPage } from '../_component/AdminPage.js';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

async function UserListPage() {
  const [tenant, currentUser] = await Promise.all([
    loadTenant({ includeStats: true }),
    loadCurrentUser({ forceAuthenticated: true }),
  ]);

  return (
    <AdminPage icon={faCircleUser} title={'Benutzer'} hasHomeLink>
      <UserList tenant={tenant} currentUser={currentUser!} />
    </AdminPage>
  );
}

export default UserListPage;
