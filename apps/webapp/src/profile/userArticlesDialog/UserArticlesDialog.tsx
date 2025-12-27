'use client';
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabbar,
} from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { ArticlesByUser } from 'article/relatedArticlesList';
import { isBrowser } from 'util/isBrowser';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { useTranslation } from 'react-i18next';

import styles from './UserArticlesDialog.module.scss';

export interface UserArticlesDialogProps {
  users: UserModel[] | null;
  onRequestClose(): void;
}

export const UserArticlesDialog = React.memo(
  ({ users, onRequestClose }: UserArticlesDialogProps) => {
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = React.useState(
      users?.at(0) ?? null
    );

    React.useEffect(() => {
      setSelectedUser(users?.at(0) ?? null);
    }, [users]);

    // TODO: use router from next/navigation as soon
    // as we fully switch to app router
    React.useEffect(() => {
      if (!isBrowser()) {
        return;
      }
      window.addEventListener('popstate', onRequestClose);

      return () => {
        window.removeEventListener('popstate', onRequestClose);
      };
    }, [onRequestClose]);

    return (
      <Dialog
        open={!!users}
        className={styles.root}
        title={t('more articles from {{username}}', {
          username: User.getName(selectedUser),
        })}
        onRequestClose={onRequestClose}
      >
        <DialogContent className={styles.content}>
          {!!users && (
            <>
              <Tabbar
                className={styles.tabbar}
                value={selectedUser?.id}
                onChange={(userId) => {
                  const newSelectedUser = users.find(({ id }) => userId === id);
                  if (newSelectedUser) {
                    setSelectedUser(newSelectedUser);
                  }
                }}
              >
                {users.map((user) => (
                  <Tab key={user.id} value={user.id}>
                    <UserAvatar
                      user={user}
                      className={styles.tabbarAvatar}
                      size={50}
                      style={{ width: '2em', height: '2em' }}
                    />{' '}
                    {user.name}
                  </Tab>
                ))}
              </Tabbar>
              {selectedUser && (
                <ArticlesByUser key={selectedUser.id} user={selectedUser} />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onRequestClose();
            }}
          >
            zurück
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
UserArticlesDialog.displayName = 'UserArticlesDialog';
