import * as React from 'react';
import { Main } from 'layout/Main';
import { User } from 'util/model';
import { loadCurrentUser } from '../../loader/loadCurrentUser';

import styles from './layout.module.scss';

interface AdminPageProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminPageProps) {
  const user = await loadCurrentUser();
  const isAllowed = User.isAdmin(user);

  if (!isAllowed) {
    return <div>Du nicht!</div>;
  }

  return <Main className={styles.root}>{children}</Main>;
}
