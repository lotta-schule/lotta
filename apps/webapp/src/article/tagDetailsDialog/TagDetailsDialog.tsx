import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { ArticlesByTag } from '../relatedArticlesList/index.js';
import { isBrowser } from '#/util/isBrowser.js';

import styles from './TagDetailsDialog.module.scss';

export interface TagDetailsDialogProps {
  tag: string | null;
  onRequestClose(): void;
}

export const TagDetailsDialog = React.memo(
  ({ tag, onRequestClose }: TagDetailsDialogProps) => {
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
        open={!!tag}
        className={styles.root}
        title={`Weitere Beiträge zum Thema: ${tag}`}
        onRequestClose={onRequestClose}
      >
        <DialogContent>
          {tag && <ArticlesByTag tag={tag} hideTitle></ArticlesByTag>}
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
TagDetailsDialog.displayName = 'TagDetailsDialog';
