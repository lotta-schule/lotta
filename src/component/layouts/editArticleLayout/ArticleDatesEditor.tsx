import * as React from 'react';
import { DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { Button } from 'component/general/button/Button';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { format } from 'date-fns';
import { ArticleModel } from 'model';

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
                    <Label label={'Beitrag wurde erstellt am:'}>
                        <Input
                            type={'date'}
                            value={format(new Date(insertedDate), 'yyyy-MM-dd')}
                            onChange={(e) =>
                                setInsertedDate(e.currentTarget.value)
                            }
                            role={'textbox'}
                            aria-label={'Beitrag erstellt am'}
                        />
                    </Label>
                    <Label label={'Beitrag wurde zuletzt geändert am:'}>
                        <Input
                            disabled
                            type={'date'}
                            value={format(
                                new Date(article.updatedAt),
                                'yyyy-MM-dd'
                            )}
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
