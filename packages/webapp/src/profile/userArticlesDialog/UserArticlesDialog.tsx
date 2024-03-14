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
import { useRouter } from 'next/router';

import styles from './UserArticlesDialog.module.scss';

export interface UserArticlesDialogProps {
  user: UserModel | null;
  onRequestClose(): void;
}

export const UserArticlesDialog = React.memo(
  ({ user, onRequestClose }: UserArticlesDialogProps) => {
    const router = useRouter();

    React.useEffect(() => {
      router.events.on('routeChangeStart', onRequestClose);

      return () => {
        router.events.off('routeChangeStart', onRequestClose);
      };
    }, [router, onRequestClose]);

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
