import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';

import styles from './UserArticlesDialog.module.scss';

export interface UserArticlesDialogProps {
  user: UserModel | null;
  onRequestClose(): void;
}

export interface RelatedArticlesListProps {
  tag: string;
}

export const UserArticlesDialog = React.memo<UserArticlesDialogProps>(
  ({ user, onRequestClose }) => {
    const { baseUrl } = useServerData();
    return (
      <Dialog
        open={!!user}
        className={styles.root}
        title={`Weitere Beiträge von ${User.getName(user)}`}
        onRequestClose={onRequestClose}
      >
        <DialogContent>
          {user && (
            <>
              <UserAvatar
                className={styles.avatarImage}
                size={40}
                user={user}
              />
              <div className={styles.userInfo}>{User.getName(user)}</div>
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
