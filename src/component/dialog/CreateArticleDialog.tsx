import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core';
import { ArticleModel, ArticleModelInput } from '../../model';
import { CreateArticleMutation } from 'api/mutation/CreateArticleMutation';
import { client } from 'api/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';

export interface CreateArticleDialogProps {
    isOpen: boolean;
    onConfirm(article: ArticleModel): void;
    onAbort(): void;
}

export const CreateArticleDialog: FunctionComponent<CreateArticleDialogProps> = memo(({
    isOpen,
    onConfirm,
    onAbort
}) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const resetForm = () => {
        setTitle('');
    }
    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <form onSubmit={async (e) => {
                e.preventDefault();
                setErrorMessage(null);
                setIsLoading(true);
                try {
                    const { data } = await client.mutate<{ article: ArticleModel }, { article: Partial<ArticleModelInput> }>({
                        mutation: CreateArticleMutation,
                        fetchPolicy: 'no-cache',
                        variables: {
                            article: {
                                title
                            }
                        }
                    });
                    const ownArticles = await client.readQuery<{ articles: ArticleModel[] }>({
                        query: GetOwnArticlesQuery
                    });
                    if (data && ownArticles && ownArticles.articles !== undefined) {
                        await client.writeQuery<{ articles: ArticleModel[] }>({
                            query: GetOwnArticlesQuery,
                            data: {
                                articles: ownArticles.articles.concat([data.article])
                            }
                        });
                    }
                    resetForm();
                    onConfirm(data!.article);
                } catch (e) {
                    console.error(e);
                    setErrorMessage(e.message);
                } finally {
                    setIsLoading(false);
                }
            }}>
                <DialogTitle>Beitrag erstellen</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Wähle zunächst einen Titel für deinen Beitrag
                    </DialogContentText>
                    {errorMessage && (
                        <p style={{ color: 'red' }}>{errorMessage}</p>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={isLoading}
                        label="Titel des Artikels:"
                        placeholder="Mein neuer Artikel"
                        type="text"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            resetForm();
                            onAbort();
                        }}
                        color="secondary"
                        variant="outlined"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type={'submit'}
                        disabled={isLoading}
                        color="secondary"
                        variant="contained"
                    >
                        Artikel erstellen
                    </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    );
});