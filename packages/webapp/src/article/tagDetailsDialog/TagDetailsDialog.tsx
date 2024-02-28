import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { RelatedArticlesList } from '../relatedArticlesList/RelatedArticlesList';
import styles from './TagDetailsDialog.module.scss';
export interface TagDetailsDialogProps {
  tag: string | null;
  onRequestClose(): void;
}

export interface RelatedArticlesListProps {
  tag: string;
}

export const TagDetailsDialog = React.memo<TagDetailsDialogProps>(
  ({ tag, onRequestClose }) => {
    return (
      <Dialog
        open={!!tag}
        className={styles.root}
        title={`Weitere Beiträge zum Thema: ${tag}`}
        onRequestClose={onRequestClose}
      >
        <DialogContent>
          {tag && (
            <RelatedArticlesList tag={tag} hideTitle></RelatedArticlesList>
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
TagDetailsDialog.displayName = 'TagDetailsDialog';
