import * as React from 'react';
import { format } from 'date-fns';
import { ArticleModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  Label,
} from '@lotta-schule/hubert';

export interface ArticleDatesEditorProps {
  article: ArticleModel;
  isOpen: boolean;
  onUpdate: (values: Pick<ArticleModel, 'insertedAt'>) => void;
  onAbort: () => void;
}

export const ArticleDatesEditor = React.memo<ArticleDatesEditorProps>(
  ({ article, isOpen, onUpdate, onAbort }) => {
    const [insertedDate, setInsertedDate] = React.useState(article.insertedAt);

    return (
      <Dialog
        open={isOpen}
        data-testid={'ArticleDatesEditor'}
        title={'Beitragsdaten ändern'}
        onRequestClose={onAbort}
      >
        <DialogContent>
          <Label label={'Beitrag wurde erstellt am:'}>
            <Input
              type={'date'}
              value={format(new Date(insertedDate), 'yyyy-MM-dd')}
              onChange={(e) => setInsertedDate(e.currentTarget.value)}
              role={'textbox'}
              aria-label={'Beitrag erstellt am'}
            />
          </Label>
          <Label label={'Beitrag wurde zuletzt geändert am:'}>
            <Input
              disabled
              type={'date'}
              value={format(new Date(article.updatedAt), 'yyyy-MM-dd')}
              role={'textbox'}
              aria-label={'Beitrag geändert am'}
            />
          </Label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onAbort()}>Abbrechen</Button>
          <Button
            onClick={() =>
              onUpdate({
                insertedAt: new Date(insertedDate).toISOString(),
              })
            }
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
ArticleDatesEditor.displayName = 'ArticleDatesEditor';
