import * as React from 'react';
import { loadCurrentUser, loadTenant } from 'loader';
import { UserList } from './UserList';

export async function UserListPage() {
  const [tenant, currentUser] = await Promise.all([
    loadTenant({ includeStats: true }),
    loadCurrentUser({ forceAuthenticated: true }),
  ]);

  return <UserList tenant={tenant} currentUser={currentUser!} />;
}

export default UserListPage;
