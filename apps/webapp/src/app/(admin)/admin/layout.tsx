import * as React from 'react';
import { User } from '#/util/model/index.js';
import { loadCurrentUser } from '#/loader/index.js';
import { ForbiddenErrorPage } from '#/layout/error/ForbiddenErrorPage.js';

interface AdminPageProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminPageProps) {
  const user = await loadCurrentUser();
  const isAllowed = User.isAdmin(user);

  if (!isAllowed) {
    return <ForbiddenErrorPage />;
  }

  return children;
}
