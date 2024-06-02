import * as React from 'react';
import { User } from 'util/model';
import { loadCurrentUser } from 'loader';

interface AdminPageProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminPageProps) {
  const user = await loadCurrentUser();
  const isAllowed = User.isAdmin(user);

  if (!isAllowed) {
    return <div>Du nicht!</div>;
  }

  return children;
}
