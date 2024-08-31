import * as React from 'react';
import { loadCurrentUser, loadTenant } from 'loader';
import { UserList } from './UserList';
import { AdminPage } from '../_component/AdminPage';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

async function UserListPage() {
  const [tenant, currentUser] = await Promise.all([
    loadTenant({ includeStats: true }),
    loadCurrentUser({ forceAuthenticated: true }),
  ]);

  return (
    <AdminPage
      icon={faCircleUser}
      title={'Benutzer'}
      hasHomeLink
      takesFullSpace
    >
      <UserList tenant={tenant} currentUser={currentUser!} />
    </AdminPage>
  );
}

export default UserListPage;
