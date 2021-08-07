import {
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { Button } from 'component/general/button/Button';
import { format } from 'date-fns';
import { ArticleModel } from 'model';
import * as React from 'react';

export interface ArticleDatesEditorProps {
    article: ArticleModel;
    isOpen: boolean;
    onUpdate: (values: Pick<ArticleModel, 'insertedAt'>) => void;
    onAbort: () => void;
}

export const ArticleDatesEditor = React.memo<ArticleDatesEditorProps>(
    ({ article, isOpen, onUpdate, onAbort }) => {
        const [insertedDate, setInsertedDate] = React.useState(
            article.insertedAt
        );

        return (
            <ResponsiveFullScreenDialog
                open={isOpen}
                data-testid={'ArticleDatesEditor'}
            >
                <DialogTitle>Beitragsdaten ändern</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        type={'date'}
                        value={format(new Date(insertedDate), 'yyyy-MM-dd')}
                        onChange={(e) => setInsertedDate(e.target.value)}
                        label={'Beitrag wurde erstellt am:'}
                        inputProps={{
                            role: 'textbox',
                            'aria-label': 'Beitrag erstellt am',
                        }}
                    />
                    <TextField
                        fullWidth
                        disabled
                        type={'date'}
                        value={format(
                            new Date(article.updatedAt),
                            'yyyy-MM-dd'
                        )}
                        label={'Beitrag wurde zuletzt geändert am:'}
                        inputProps={{
                            role: 'textbox',
                            'aria-label': 'Beitrag geändert am',
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onAbort()}>Abbrechen</Button>
                    <Button
                        onClick={() =>
                            onUpdate({
                                insertedAt: new Date(
                                    insertedDate
                                ).toISOString(),
                            })
                        }
                    >
                        OK
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        );
    }
);
