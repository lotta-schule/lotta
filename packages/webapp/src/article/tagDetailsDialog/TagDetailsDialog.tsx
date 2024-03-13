import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { ArticlesByTag } from '../relatedArticlesList';
import styles from './TagDetailsDialog.module.scss';
export interface TagDetailsDialogProps {
  tag: string | null;
  onRequestClose(): void;
}

export interface ArticlesByTagProps {
  tag: string;
}

export const TagDetailsDialog = React.memo(
  ({ tag, onRequestClose }: TagDetailsDialogProps) => {
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
