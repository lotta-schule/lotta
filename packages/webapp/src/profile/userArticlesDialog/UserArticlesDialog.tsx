import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { ArticlesByUser } from 'article/relatedArticlesList';
import { isBrowser } from 'util/isBrowser';

import styles from './UserArticlesDialog.module.scss';

export interface UserArticlesDialogProps {
  user: UserModel | null;
  onRequestClose(): void;
}

export const UserArticlesDialog = React.memo(
  ({ user, onRequestClose }: UserArticlesDialogProps) => {
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
        open={!!user}
        className={styles.root}
        title={`Weitere Beiträge von ${User.getName(user)}`}
        onRequestClose={onRequestClose}
      >
        <DialogContent>
          {user && <ArticlesByUser key={user.id} user={user} />}
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
